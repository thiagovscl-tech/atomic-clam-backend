import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeSessionCommand } from '../commands/revoke-session.command';
import { SessionsService } from '../sessions.service';

@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler implements ICommandHandler<RevokeSessionCommand> {
  constructor(private readonly sessionsService: SessionsService) {}

  execute(command: RevokeSessionCommand) {
    return this.sessionsService.revoke(command.sessionId);
  }
}
