import { BirthDateProvider } from './birth-date.provider';
import { AgeProvider, VerifyAgeInput } from './age-provider.interface';
import { AgeVerificationResult } from '../../common/contracts/age-verification.contracts';

/**
 * EUA: por padrão usa data de nascimento, mas permite registrar
 * providers específicos por estado (ex.: Louisiana, Texas, Utah exigem
 * verificação por documento/ID a partir de leis estaduais recentes).
 */
export class USProvider extends BirthDateProvider {
  private readonly stateProviders = new Map<string, AgeProvider>();

  constructor(minimumAge = 18) {
    super(minimumAge, 'USProvider');
  }

  registerStateProvider(stateCode: string, provider: AgeProvider): void {
    this.stateProviders.set(stateCode.toUpperCase(), provider);
  }

  verify(input: VerifyAgeInput): AgeVerificationResult | Promise<AgeVerificationResult> {
    const stateProvider = input.region ? this.stateProviders.get(input.region.toUpperCase()) : undefined;
    return stateProvider ? stateProvider.verify(input) : super.verify(input);
  }
}
