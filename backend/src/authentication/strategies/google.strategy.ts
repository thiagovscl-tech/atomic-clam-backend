import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

/**
 * Estratégia oficial do Google OAuth 2.0 (passport-google-oauth20).
 * Nenhuma simulação: o Google efetivamente autentica o usuário e retorna
 * o perfil validado aqui, dentro do fluxo real do `authorization_code`.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Conta Google sem e-mail público disponível.'), false);
      return;
    }

    const validatedProfile = {
      provider: 'google' as const,
      providerUserId: profile.id,
      email,
      name: profile.displayName || email,
      picture: profile.photos?.[0]?.value ?? null,
      emailVerified: Boolean((profile as any)._json?.email_verified),
    };

    done(null, validatedProfile);
  }
}
