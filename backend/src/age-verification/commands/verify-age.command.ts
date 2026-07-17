import { BirthDateInput, RegionInfo } from '../../common/contracts/age-verification.contracts';

export class VerifyAgeCommand {
  constructor(
    public readonly userId: string,
    public readonly birthDate: BirthDateInput,
    public readonly region: RegionInfo,
  ) {}
}
