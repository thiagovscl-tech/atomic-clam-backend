export class MarkAgeVerifiedCommand {
  constructor(public readonly userId: string, public readonly ageVerified: boolean) {}
}
