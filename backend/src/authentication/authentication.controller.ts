import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { OAuthProfileInput, UserRecord } from '../common/contracts/user.contracts';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  // ---------- Email + senha ----------

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const result = await this.authenticationService.signup(dto);
    return this.toClientResponse(result);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request: Request & { user: UserRecord }) {
    const result = await this.authenticationService.loginWithPassword(request.user);
    return this.toClientResponse(result);
  }

  // ---------- Google OAuth 2.0 ----------
  // Fluxo: usuário clica "Continuar com Google" -> tela oficial do Google
  // -> Google redireciona para /auth/google/callback com o código
  // -> passport-google-oauth20 troca o código por tokens e valida o perfil
  // -> AuthenticationService decide login vs. criação de conta.

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {
    // O guard já redireciona para a tela do Google; nada a fazer aqui.
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() request: Request & { user: OAuthProfileInput },
    @Res() response: Response,
  ) {
    const result = await this.authenticationService.loginWithOAuthProfile(request.user);
    const frontendUrl = this.configService.get<string>('CORS_ORIGIN') ?? '/';
    const nextView = result.user.ageVerified ? 'home' : 'age';

    const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set('accessToken', result.accessToken);
    redirectUrl.searchParams.set('refreshToken', result.refreshToken);
    redirectUrl.searchParams.set('next', nextView);

    response.redirect(redirectUrl.toString());
  }

  /**
   * Alternativa ao redirect acima: o frontend pode usar o Google Identity
   * Services (GIS) diretamente e enviar o ID Token aqui, sem redirect de
   * página inteira. Ambas as formas usam o MESMO AuthenticationService.
   */
  @Post('google/token')
  async googleToken(@Body('idToken') idToken: string) {
    const profile = await this.authenticationService.verifyGoogleIdToken(idToken);
    const result = await this.authenticationService.loginWithOAuthProfile(profile);
    return this.toClientResponse(result);
  }

  // ---------- Sessão ----------

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() request: Request & { user: { id: string; refreshToken: string } }) {
    const result = await this.authenticationService.refreshTokens(request.user.id, request.user.refreshToken);
    return this.toClientResponse(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: Request & { user: { id: string } }) {
    await this.authenticationService.logout(request.user.id);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: Request & { user: { id: string } }) {
    return this.authenticationService.getProfile(request.user.id);
  }

  private toClientResponse(result: {
    user: UserRecord;
    isNewUser: boolean;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) {
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      isNewUser: result.isNewUser,
      ageVerified: result.user.ageVerified,
      next: result.user.ageVerified ? 'home' : 'age',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        picture: result.user.picture,
      },
    };
  }
}
