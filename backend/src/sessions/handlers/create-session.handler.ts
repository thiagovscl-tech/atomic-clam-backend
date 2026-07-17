import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSessionCommand } from '../commands/create-session.command';
import { SessionsService } from '../sessions.service';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler implements ICommandHandler<CreateSessionCommand> {
  constructor(private readonly sessionsService: SessionsService) {}

  execute(command: CreateSessionCommand) {
    return this.sessionsService.create({
      userId: command.userId,
      refreshToken: command.refreshToken,
      expiresAt: command.expiresAt,
      userAgent: command.userAgent,
      ipAddress: command.ipAddress,
    });
  }
}
