import { CreateSessionHandler } from './create-session.handler';
import { RevokeSessionHandler } from './revoke-session.handler';
import { RevokeAllSessionsHandler } from './revoke-all-sessions.handler';
import { MatchRefreshTokenHandler } from './match-refresh-token.handler';

export const SessionsHandlers = [
  CreateSessionHandler,
  RevokeSessionHandler,
  RevokeAllSessionsHandler,
  MatchRefreshTokenHandler,
];
