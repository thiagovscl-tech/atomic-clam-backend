import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { typeOrmConfig } from './config/typeorm.config';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { AgeVerificationModule } from './age-verification/age-verification.module';
import { SessionsModule } from './sessions/sessions.module';
import { UsersModule } from './users/users.module';

/**
 * A composição da árvore de módulos acontece só aqui, no topo. Cada
 * módulo de domínio (Authentication, Authorization, AgeVerification,
 * Sessions, Users) permanece isolado dos demais — veja o comentário em
 * cada *.module.ts.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    UsersModule,
    SessionsModule,
    AgeVerificationModule,
    AuthorizationModule,
    AuthenticationModule,
  ],
})
export class AppModule {}
