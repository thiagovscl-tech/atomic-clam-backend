import { AgeVerificationResult } from '../../common/contracts/age-verification.contracts';
import { AgeProvider, VerifyAgeInput } from './age-provider.interface';

/**
 * Provider base: calcula idade a partir de data de nascimento.
 * Serve tanto como implementação direta (fallback universal) quanto
 * como classe-mãe para providers regionais (ex.: BrazilProvider).
 */
export class BirthDateProvider implements AgeProvider {
  readonly verificationMethod = 'birth_date';

  constructor(
    protected readonly minimumAge: number = 18,
    public readonly providerName: string = 'BirthDateProvider',
  ) {}

  verify(input: VerifyAgeInput): AgeVerificationResult | Promise<AgeVerificationResult> {
    const { birthDate, countryCode, region = '' } = input;

    if (!birthDate || !this.isValidBirthDate(birthDate)) {
      return this.result({ countryCode, region, isAdult: false, age: null, reason: 'invalid_birth_date' });
    }

    const date = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    const age = this.calculateAge(date);
    const isAdult = age >= this.minimumAge;

    return this.result({
      countryCode,
      region,
      isAdult,
      age,
      reason: isAdult ? 'eligible' : 'under_minimum_age',
    });
  }

  private isValidBirthDate(birthDate: { day: number; month: number; year: number }): boolean {
    const { day, month, year } = birthDate;
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return false;
    if (year < 1900) return false;
    const date = new Date(year, month - 1, day);
    const valid =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return valid && date <= new Date();
  }

  private calculateAge(date: Date): number {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDelta = today.getMonth() - date.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) age -= 1;
    return age;
  }

  protected result(params: {
    countryCode: string;
    region: string;
    isAdult: boolean;
    age: number | null;
    reason: string;
  }): AgeVerificationResult {
    return {
      ageVerified: params.isAdult,
      isAdult: params.isAdult,
      age: params.age,
      countryCode: params.countryCode,
      region: params.region,
      verificationMethod: this.verificationMethod,
      verificationProvider: this.providerName,
      ageVerifiedAt: params.isAdult ? new Date().toISOString() : null,
      reason: params.reason,
    };
  }
}
