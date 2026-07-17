import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyAgeCommand } from '../commands/verify-age.command';
import { AgeVerificationService } from '../age-verification.service';
import { MarkAgeVerifiedCommand } from '../../users/commands/mark-age-verified.command';

@CommandHandler(VerifyAgeCommand)
export class VerifyAgeHandler implements ICommandHandler<VerifyAgeCommand> {
  constructor(
    private readonly ageVerificationService: AgeVerificationService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: VerifyAgeCommand) {
    const result = await this.ageVerificationService.verify({
      birthDate: command.birthDate,
      region: command.region,
    });

    // AgeVerification não escreve na tabela `users` diretamente: delega
    // a atualização via Command, mantendo os módulos desacoplados.
    await this.commandBus.execute(new MarkAgeVerifiedCommand(command.userId, result.ageVerified));

    return result;
  }
}
