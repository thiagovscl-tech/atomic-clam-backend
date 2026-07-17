import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MatchRefreshTokenQuery } from '../queries/match-refresh-token.query';
import { SessionsService } from '../sessions.service';

@QueryHandler(MatchRefreshTokenQuery)
export class MatchRefreshTokenHandler implements IQueryHandler<MatchRefreshTokenQuery> {
  constructor(private readonly sessionsService: SessionsService) {}

  execute(query: MatchRefreshTokenQuery) {
    return this.sessionsService.matchRefreshToken(query.userId, query.refreshToken);
  }
}
