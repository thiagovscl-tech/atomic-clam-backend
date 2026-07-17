export class CreateSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly refreshToken: string,
    public readonly expiresAt: Date,
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
  ) {}
}
