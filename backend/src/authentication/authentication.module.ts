import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
// Apple Sign In: descomentar quando habilitado (ver strategies/apple.strategy.stub.ts)
// import { AppleStrategy } from './strategies/apple.strategy';

/**
 * AuthenticationModule NÃO importa UsersModule, SessionsModule,
 * AgeVerificationModule nem AuthorizationModule. Toda comunicação com
 * esses domínios acontece via CommandBus/QueryBus (CqrsModule), conforme
 * os Commands/Queries definidos em cada um deles.
 */
@Module({
  imports: [ConfigModule, PassportModule, JwtModule.register({}), CqrsModule],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    GoogleStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    // AppleStrategy,
  ],
  exports: [],
})
export class AuthenticationModule {}
