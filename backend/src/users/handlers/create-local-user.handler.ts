import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLocalUserCommand } from '../commands/create-local-user.command';
import { UsersService } from '../users.service';

@CommandHandler(CreateLocalUserCommand)
export class CreateLocalUserHandler implements ICommandHandler<CreateLocalUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  execute(command: CreateLocalUserCommand) {
    return this.usersService.createLocalUser(command.input);
  }
}
