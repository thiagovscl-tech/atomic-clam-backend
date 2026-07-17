import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserByEmailQuery } from '../queries/find-user-by-email.query';
import { UsersService } from '../users.service';

@QueryHandler(FindUserByEmailQuery)
export class FindUserByEmailHandler implements IQueryHandler<FindUserByEmailQuery> {
  constructor(private readonly usersService: UsersService) {}

  execute(query: FindUserByEmailQuery) {
    return this.usersService.findByEmail(query.email);
  }
}
