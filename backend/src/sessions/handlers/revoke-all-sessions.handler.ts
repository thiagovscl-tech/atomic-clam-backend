import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeAllSessionsCommand } from '../commands/revoke-all-sessions.command';
import { SessionsService } from '../sessions.service';

@CommandHandler(RevokeAllSessionsCommand)
export class RevokeAllSessionsHandler implements ICommandHandler<RevokeAllSessionsCommand> {
  constructor(private readonly sessionsService: SessionsService) {}

  execute(command: RevokeAllSessionsCommand) {
    return this.sessionsService.revokeAllForUser(command.userId);
  }
}
