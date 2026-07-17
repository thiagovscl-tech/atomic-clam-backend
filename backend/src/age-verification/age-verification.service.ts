import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderResolver } from './providers/provider.resolver';
import { BirthDateProvider } from './providers/birth-date.provider';
import { EUProvider } from './providers/eu.provider';
import { UKProvider } from './providers/uk.provider';
import { ThirdPartyProvider } from './providers/third-party.provider';
import { AgeVerificationResult, BirthDateInput, RegionInfo } from '../common/contracts/age-verification.contracts';

@Injectable()
export class AgeVerificationService {
  private readonly resolver: ProviderResolver;
  private readonly minimumAge: number;

  constructor(private readonly configService: ConfigService) {
    this.minimumAge = Number(this.configService.get('MINIMUM_AGE') ?? 18);
    this.resolver = new ProviderResolver(this.minimumAge);
  }

  async verify(params: { birthDate: BirthDateInput; region: RegionInfo }): Promise<AgeVerificationResult> {
    const provider = this.resolver.resolve(params.region.countryCode);

    try {
      return await provider.verify({
        birthDate: params.birthDate,
        countryCode: params.region.countryCode,
        region: params.region.region,
      });
    } catch (error) {
      // Providers regionais ainda não implementados (EU/UK/terceiros) caem
      // para verificação por data de nascimento, preservando disponibilidade.
      const isPlaceholderProvider =
        provider instanceof EUProvider || provider instanceof UKProvider || provider instanceof ThirdPartyProvider;
      if (!isPlaceholderProvider) throw error;

      const fallback = new BirthDateProvider(this.minimumAge, provider.providerName);
      return fallback.verify({
        birthDate: params.birthDate,
        countryCode: params.region.countryCode,
        region: params.region.region,
      });
    }
  }
}
