import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';
import { UsersHandlers } from './handlers';

/**
 * Módulo de domínio "Users". Não importa Authentication, Sessions,
 * AgeVerification nem Authorization: só expõe comportamento via
 * Commands/Queries registrados no CqrsModule (bus compartilhado).
 */
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, ...UsersHandlers],
  exports: [],
})
export class UsersModule {}
