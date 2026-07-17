import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Dispara o fluxo oficial do Google (redireciona para a tela do Google). */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
