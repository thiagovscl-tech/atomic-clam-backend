/**
 * Apple Sign In — arquitetura preparada, ainda não habilitada.
 *
 * Para ativar:
 * 1. `npm install passport-apple`
 * 2. Preencher APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID e
 *    APPLE_PRIVATE_KEY_PATH no .env.
 * 3. Descomentar a estratégia abaixo e registrá-la em
 *    authentication.module.ts (providers) e em authentication.controller.ts
 *    (rotas /auth/apple e /auth/apple/callback), seguindo exatamente o
 *    mesmo padrão usado por GoogleStrategy.
 *
 * O restante do fluxo (AuthenticationService.loginWithOAuthProfile) já é
 * genérico por provider ('local' | 'google' | 'apple') e não precisa
 * de nenhuma alteração para suportar Apple.
 */

// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import AppleStrategyBase from 'passport-apple';
//
// @Injectable()
// export class AppleStrategy extends PassportStrategy(AppleStrategyBase, 'apple') {
//   constructor(configService: ConfigService) {
//     super({
//       clientID: configService.get<string>('APPLE_CLIENT_ID'),
//       teamID: configService.get<string>('APPLE_TEAM_ID'),
//       keyID: configService.get<string>('APPLE_KEY_ID'),
//       privateKeyLocation: configService.get<string>('APPLE_PRIVATE_KEY_PATH'),
//       callbackURL: configService.get<string>('APPLE_CALLBACK_URL'),
//       scope: ['name', 'email'],
//     });
//   }
//
//   async validate(_accessToken: string, _refreshToken: string, idToken: any, profile: any, done: Function) {
//     const email = profile?.email ?? idToken?.email;
//     done(null, {
//       provider: 'apple',
//       providerUserId: idToken?.sub,
//       email,
//       name: profile?.name?.firstName ? `${profile.name.firstName} ${profile.name.lastName ?? ''}`.trim() : email,
//       picture: null,
//       emailVerified: true,
//     });
//   }
// }
