import { AgeVerificationResult, BirthDateInput } from '../../common/contracts/age-verification.contracts';

export interface VerifyAgeInput {
  birthDate?: BirthDateInput;
  countryCode: string;
  region?: string;
  externalReference?: string; // ex.: id de verificação de um provider terceirizado
}

/**
 * Contrato que toda estratégia de verificação de idade deve implementar.
 * Novos países/reguladores só precisam de uma nova classe que implemente
 * esta interface e ser registrada no ProviderResolver.
 */
export interface AgeProvider {
  readonly providerName: string;
  readonly verificationMethod: string;
  verify(input: VerifyAgeInput): Promise<AgeVerificationResult> | AgeVerificationResult;
}
