/**
 * Microsoft Sign In (Azure AD / Entra ID) — arquitetura preparada, ainda
 * não habilitada, seguindo o mesmo padrão do apple.strategy.stub.ts.
 *
 * Para ativar:
 * 1. `npm install passport-microsoft` (ou passport-azure-ad, dependendo
 *    do tipo de conta suportado — pessoal, corporativo ou ambos).
 * 2. Registrar o app em https://portal.azure.com (Entra ID > App registrations),
 *    obtendo MICROSOFT_CLIENT_ID e MICROSOFT_CLIENT_SECRET.
 * 3. Descomentar a estratégia abaixo e registrá-la em
 *    authentication.module.ts (providers) e authentication.controller.ts
 *    (rotas /auth/microsoft e /auth/microsoft/callback), no mesmo padrão
 *    de GoogleStrategy.
 *
 * AuthenticationService.loginWithOAuthProfile já aceita qualquer
 * AuthProvider ('local' | 'google' | 'apple' | 'microsoft') sem exigir
 * nenhuma alteração adicional.
 */

// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, Profile } from 'passport-microsoft';
//
// @Injectable()
// export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
//   constructor(configService: ConfigService) {
//     super({
//       clientID: configService.get<string>('MICROSOFT_CLIENT_ID'),
//       clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET'),
//       callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL'),
//       scope: ['user.read'],
//     });
//   }
//
//   async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: Function) {
//     const email = profile.emails?.[0]?.value;
//     done(null, {
//       provider: 'microsoft',
//       providerUserId: profile.id,
//       email,
//       name: profile.displayName || email,
//       picture: null,
//       emailVerified: true,
//     });
//   }
// }
