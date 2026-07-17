import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserByIdQuery } from '../queries/find-user-by-id.query';
import { UsersService } from '../users.service';

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery> {
  constructor(private readonly usersService: UsersService) {}

  execute(query: FindUserByIdQuery) {
    return this.usersService.findById(query.id);
  }
}
