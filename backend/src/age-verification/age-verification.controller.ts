import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { VerifyAgeDto } from './dto/verify-age.dto';
import { VerifyAgeCommand } from './commands/verify-age.command';
import { GeoIPService } from './geoip.service';

/**
 * A verificação de idade é sempre um passo POSTERIOR ao login
 * (AuthenticationService -> AgeVerificationService -> Home).
 * Por isso as rotas aqui exigem um usuário já autenticado.
 */
@Controller('age-verification')
export class AgeVerificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly geoIPService: GeoIPService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verify(@Req() request: Request & { user: { id: string } }, @Body() dto: VerifyAgeDto) {
    const detectedRegion = this.geoIPService.detect(request);
    const region = {
      countryCode: dto.countryCode || detectedRegion.countryCode,
      region: dto.region ?? detectedRegion.region,
    };

    const result = await this.commandBus.execute(
      new VerifyAgeCommand(request.user.id, { day: dto.day, month: dto.month, year: dto.year }, region),
    );

    return result;
  }
}
