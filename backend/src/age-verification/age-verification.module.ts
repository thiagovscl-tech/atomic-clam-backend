import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { AgeVerificationService } from './age-verification.service';
import { AgeVerificationController } from './age-verification.controller';
import { GeoIPService } from './geoip.service';
import { AgeVerificationHandlers } from './handlers';

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [AgeVerificationController],
  providers: [AgeVerificationService, GeoIPService, ...AgeVerificationHandlers],
  exports: [],
})
export class AgeVerificationModule {}
