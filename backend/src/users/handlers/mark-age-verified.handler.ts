import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkAgeVerifiedCommand } from '../commands/mark-age-verified.command';
import { UsersService } from '../users.service';

@CommandHandler(MarkAgeVerifiedCommand)
export class MarkAgeVerifiedHandler implements ICommandHandler<MarkAgeVerifiedCommand> {
  constructor(private readonly usersService: UsersService) {}

  execute(command: MarkAgeVerifiedCommand) {
    return this.usersService.markAgeVerified(command.userId, command.ageVerified);
  }
}
