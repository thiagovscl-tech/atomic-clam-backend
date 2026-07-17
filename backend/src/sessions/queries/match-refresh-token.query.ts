export class MatchRefreshTokenQuery {
  constructor(public readonly userId: string, public readonly refreshToken: string) {}
}
