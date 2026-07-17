import { AgeProvider, VerifyAgeInput } from './age-provider.interface';
import { AgeVerificationResult } from '../../common/contracts/age-verification.contracts';

/**
 * Placeholder genérico para provedores comerciais de verificação de idade
 * (ex.: Yoti, Veriff, Persona) usados como camada adicional em jurisdições
 * que exigem verificação além da autodeclaração de data de nascimento.
 */
export class ThirdPartyProvider implements AgeProvider {
  readonly providerName = 'ThirdPartyProvider';
  readonly verificationMethod = 'future_third_party_provider';

  verify(_input: VerifyAgeInput): AgeVerificationResult {
    throw new Error('ThirdPartyProvider ainda não implementado: configurar integração com o fornecedor escolhido.');
  }
}
