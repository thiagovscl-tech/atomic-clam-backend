import { AgeProvider, VerifyAgeInput } from './age-provider.interface';
import { AgeVerificationResult } from '../../common/contracts/age-verification.contracts';

/**
 * Placeholder para integração futura com provedor de verificação de idade
 * certificado sob o Online Safety Act (Ofcom) no Reino Unido.
 */
export class UKProvider implements AgeProvider {
  readonly providerName = 'UKProvider';
  readonly verificationMethod = 'future_uk_age_assurance_provider';

  verify(_input: VerifyAgeInput): AgeVerificationResult {
    throw new Error('UKProvider ainda não implementado: aguardando integração com provedor certificado Ofcom.');
  }
}
