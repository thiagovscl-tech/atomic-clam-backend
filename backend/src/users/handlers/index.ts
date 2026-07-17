import { FindOrCreateUserHandler } from './find-or-create-user.handler';
import { CreateLocalUserHandler } from './create-local-user.handler';
import { TouchLastLoginHandler } from './touch-last-login.handler';
import { MarkAgeVerifiedHandler } from './mark-age-verified.handler';
import { FindUserByEmailHandler } from './find-user-by-email.handler';
import { FindUserByIdHandler } from './find-user-by-id.handler';

export const UsersHandlers = [
  FindOrCreateUserHandler,
  CreateLocalUserHandler,
  TouchLastLoginHandler,
  MarkAgeVerifiedHandler,
  FindUserByEmailHandler,
  FindUserByIdHandler,
];
