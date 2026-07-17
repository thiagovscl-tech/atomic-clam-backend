import { BirthDateProvider } from './birth-date.provider';

/**
 * Brasil hoje usa apenas data de nascimento (Marco Civil / LGPD não exigem
 * verificação por documento para este tipo de conteúdo). Estrutura pronta
 * para evoluir para um provider de identidade (ex.: gov.br) no futuro.
 */
export class BrazilProvider extends BirthDateProvider {
  constructor(minimumAge = 18) {
    super(minimumAge, 'BrazilProvider');
  }
}
