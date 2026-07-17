import { UserEntity } from './user.entity';
import { UserRecord } from '../common/contracts/user.contracts';

export function toUserRecord(entity: UserEntity): UserRecord {
  return {
    id: entity.id,
    provider: entity.provider,
    providerUserId: entity.providerUserId,
    email: entity.email,
    passwordHash: entity.passwordHash,
    name: entity.name,
    picture: entity.picture,
    emailVerified: entity.emailVerified,
    ageVerified: entity.ageVerified,
    lastLoginAt: entity.lastLoginAt,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
