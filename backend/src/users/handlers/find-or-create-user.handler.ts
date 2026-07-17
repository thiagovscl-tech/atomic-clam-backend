import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FindOrCreateUserCommand } from '../commands/find-or-create-user.command';
import { UsersService } from '../users.service';

@CommandHandler(FindOrCreateUserCommand)
export class FindOrCreateUserHandler implements ICommandHandler<FindOrCreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute(command: FindOrCreateUserCommand) {
    return this.usersService.findOrCreateFromOAuth(command.profile);
  }
}
