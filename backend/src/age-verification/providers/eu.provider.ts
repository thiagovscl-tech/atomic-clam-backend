import { AgeProvider, VerifyAgeInput } from './age-provider.interface';
import { AgeVerificationResult } from '../../common/contracts/age-verification.contracts';

/**
 * Placeholder para a futura integração com a EUDI Wallet (European Digital
 * Identity Wallet) ou provedor de "age assurance" equivalente na UE.
 * Ainda não implementado: o ProviderResolver deve tratar a exceção e
 * aplicar fallback para verificação por data de nascimento.
 */
export class EUProvider implements AgeProvider {
  readonly providerName = 'EUProvider';
  readonly verificationMethod = 'future_eu_digital_identity_wallet';

  verify(_input: VerifyAgeInput): AgeVerificationResult {
    throw new Error('EUProvider ainda não implementado: aguardando integração com EUDI Wallet.');
  }
}
