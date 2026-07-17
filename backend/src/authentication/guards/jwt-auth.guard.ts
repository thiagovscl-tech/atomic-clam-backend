import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protege rotas que exigem um access token JWT válido. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {}
