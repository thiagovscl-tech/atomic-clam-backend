import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { SessionEntity } from './session.entity';
import { SessionsService } from './sessions.service';
import { SessionsHandlers } from './handlers';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([SessionEntity])],
  providers: [SessionsService, ...SessionsHandlers],
  exports: [],
})
export class SessionsModule {}
