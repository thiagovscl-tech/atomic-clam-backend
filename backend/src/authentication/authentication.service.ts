import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

import { OAuthProfileInput, UserRecord } from '../common/contracts/user.contracts';
import { FindOrCreateUserCommand } from '../users/commands/find-or-create-user.command';
import { CreateLocalUserCommand } from '../users/commands/create-local-user.command';
import { TouchLastLoginCommand } from '../users/commands/touch-last-login.command';
import { FindUserByEmailQuery } from '../users/queries/find-user-by-email.query';
import { FindUserByIdQuery } from '../users/queries/find-user-by-id.query';
import { CreateSessionCommand } from '../sessions/commands/create-session.command';
import { RevokeSessionCommand } from '../sessions/commands/revoke-session.command';
import { RevokeAllSessionsCommand } from '../sessions/commands/revoke-all-sessions.command';
import { MatchRefreshTokenQuery } from '../sessions/queries/match-refresh-token.query';

export interface AuthResult {
  user: UserRecord;
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Único ponto de entrada da autenticação, usado por TODOS os providers
 * (Email/Senha, Google, e futuramente Apple). Fala com Users e Sessions
 * exclusivamente via CommandBus/QueryBus — nunca importa UsersService ou
 * SessionsService diretamente.
 *
 * Fluxo (Google, igual ao pedido):
 * Google valida -> validateOAuthLogin() procura/cria usuário -> gera
 * access+refresh token -> cria sessão -> AuthenticationController decide
 * se manda para Home ou para Age Verification, olhando `user.ageVerified`.
 */
@Injectable()
export class AuthenticationService {
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.accessTokenExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    this.refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  /**
   * Valida o credential (ID Token JWT) emitido pelo Google Identity
   * Services no frontend. Verificação real de assinatura/emissor/audience
   * feita pela biblioteca oficial `google-auth-library` — sem simulação.
   */
  async verifyGoogleIdToken(idToken: string): Promise<OAuthProfileInput> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException('Token do Google inválido ou sem e-mail.');
    }

    return {
      provider: 'google',
      providerUserId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture ?? null,
      emailVerified: Boolean(payload.email_verified),
    };
  }

  async getProfile(userId: string): Promise<UserRecord | null> {
    return this.queryBus.execute<FindUserByIdQuery, UserRecord | null>(new FindUserByIdQuery(userId));
  }

  // ---------- Email + senha ----------

  async validateLocalUser(email: string, password: string): Promise<UserRecord | null> {
    const user = await this.queryBus.execute<FindUserByEmailQuery, UserRecord | null>(
      new FindUserByEmailQuery(email),
    );
    if (!user || !user.passwordHash) return null;
    const matches = await bcrypt.compare(password, user.passwordHash);
    return matches ? user : null;
  }

  async signup(input: { email: string; name: string; password: string }): Promise<AuthResult> {
    const existing = await this.queryBus.execute<FindUserByEmailQuery, UserRecord | null>(
      new FindUserByEmailQuery(input.email),
    );
    if (existing) throw new UnauthorizedException('Já existe uma conta com este e-mail.');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.commandBus.execute<CreateLocalUserCommand, UserRecord>(
      new CreateLocalUserCommand({ email: input.email, name: input.name, passwordHash }),
    );

    return this.completeLogin(user, false);
  }

  async loginWithPassword(user: UserRecord): Promise<AuthResult> {
    return this.completeLogin(user, false);
  }

  // ---------- Google / Apple (OAuth) ----------

  /**
   * Chamado depois que a estratégia Passport (Google/Apple) já validou o
   * usuário junto ao provedor. Implementa exatamente:
   * procura usuário -> existe? login : cria conta -> gera tokens -> sessão.
   */
  async loginWithOAuthProfile(profile: OAuthProfileInput): Promise<AuthResult> {
    const { user, isNewUser } = await this.commandBus.execute<
      FindOrCreateUserCommand,
      { user: UserRecord; isNewUser: boolean }
    >(new FindOrCreateUserCommand(profile));

    return this.completeLogin(user, isNewUser);
  }

  // ---------- Tokens / sessão ----------

  private async completeLogin(user: UserRecord, isNewUser: boolean): Promise<AuthResult> {
    await this.commandBus.execute(new TouchLastLoginCommand(user.id));

    const { accessToken, refreshToken, expiresIn } = await this.issueTokens(user);

    return { user, isNewUser, accessToken, refreshToken, expiresIn };
  }

  private async issueTokens(
    user: UserRecord,
    session?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, ageVerified: user.ageVerified },
      { secret: this.configService.get('JWT_ACCESS_SECRET'), expiresIn: this.accessTokenExpiresIn },
    );

    const refreshTokenId = uuid();
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, jti: refreshTokenId },
      { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: this.refreshTokenExpiresIn },
    );

    const expiresAt = this.addDuration(new Date(), this.refreshTokenExpiresIn);
    await this.commandBus.execute(
      new CreateSessionCommand(user.id, refreshToken, expiresAt, session?.userAgent, session?.ipAddress),
    );

    return { accessToken, refreshToken, expiresIn: this.parseExpiresInSeconds(this.accessTokenExpiresIn) };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthResult> {
    const session = await this.queryBus.execute(new MatchRefreshTokenQuery(userId, refreshToken));
    if (!session) throw new UnauthorizedException('Sessão expirada ou inválida. Faça login novamente.');

    const user = await this.queryBus.execute<FindUserByIdQuery, UserRecord | null>(new FindUserByIdQuery(userId));
    if (!user) throw new UnauthorizedException('Usuário não encontrado.');

    // Rotaciona o refresh token: revoga a sessão antiga e cria uma nova.
    await this.commandBus.execute(new RevokeSessionCommand(session.id));
    const tokens = await this.issueTokens(user);

    return { user, isNewUser: false, ...tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.commandBus.execute(new RevokeAllSessionsCommand(userId));
  }

  private addDuration(date: Date, duration: string): Date {
    const match = /^(\d+)([smhd])$/.exec(duration.trim());
    if (!match) return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    const value = Number(match[1]);
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]] ?? 86_400_000;
    return new Date(date.getTime() + value * unitMs);
  }

  private parseExpiresInSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration.trim());
    if (!match) return 900;
    const value = Number(match[1]);
    const unitSeconds = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]] ?? 1;
    return value * unitSeconds;
  }
}
