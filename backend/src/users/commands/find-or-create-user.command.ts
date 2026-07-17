import { OAuthProfileInput } from '../../common/contracts/user.contracts';

/**
 * Emitido pelo AuthenticationModule quando um provider OAuth (Google/Apple)
 * retorna um perfil validado. Tratado exclusivamente dentro do UsersModule.
 */
export class FindOrCreateUserCommand {
  constructor(public readonly profile: OAuthProfileInput) {}
}
