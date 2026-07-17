import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protege a rota de refresh, validando o refresh token enviado no corpo. */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
