import { Injectable } from '@nestjs/common';
import { AgeProvider } from './age-provider.interface';
import { BirthDateProvider } from './birth-date.provider';
import { BrazilProvider } from './brazil.provider';
import { USProvider } from './us.provider';
import { EUProvider } from './eu.provider';
import { UKProvider } from './uk.provider';

const EU_COUNTRY_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

/**
 * Resolve qual AgeProvider aplicar de acordo com o país detectado.
 * Adicionar um novo país/jurisdição = adicionar um `case` aqui,
 * sem tocar em AgeVerificationService nem no restante da aplicação.
 */
@Injectable()
export class ProviderResolver {
  constructor(private readonly minimumAge: number = 18) {}

  resolve(countryCode: string): AgeProvider {
    switch (countryCode) {
      case 'BR':
        return new BrazilProvider(this.minimumAge);
      case 'US':
        return new USProvider(this.minimumAge);
      case 'GB':
        return new UKProvider();
      default:
        return EU_COUNTRY_CODES.has(countryCode)
          ? new EUProvider()
          : new BirthDateProvider(this.minimumAge, 'BirthDateProvider');
    }
  }
}
