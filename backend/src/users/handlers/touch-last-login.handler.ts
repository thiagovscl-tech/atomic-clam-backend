import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TouchLastLoginCommand } from '../commands/touch-last-login.command';
import { UsersService } from '../users.service';

@CommandHandler(TouchLastLoginCommand)
export class TouchLastLoginHandler implements ICommandHandler<TouchLastLoginCommand> {
  constructor(private readonly usersService: UsersService) {}

  execute(command: TouchLastLoginCommand) {
    return this.usersService.touchLastLogin(command.userId);
  }
}
