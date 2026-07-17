import { LocalSignupInput } from '../../common/contracts/user.contracts';

export class CreateLocalUserCommand {
  constructor(public readonly input: LocalSignupInput) {}
}
