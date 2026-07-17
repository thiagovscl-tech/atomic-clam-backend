import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { toUserRecord } from './users.mapper';
import {
  AuthProvider,
  LocalSignupInput,
  OAuthProfileInput,
  UserRecord,
} from '../common/contracts/user.contracts';

/**
 * Regras de persistência de usuários. Único ponto do sistema que escreve
 * na tabela `users`. É consumido apenas através de Commands/Queries
 * (ver ./handlers), nunca importado diretamente por outros módulos.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const entity = await this.usersRepository.findOne({ where: { email } });
    return entity ? toUserRecord(entity) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const entity = await this.usersRepository.findOne({ where: { id } });
    return entity ? toUserRecord(entity) : null;
  }

  async findByProvider(provider: AuthProvider, providerUserId: string): Promise<UserRecord | null> {
    const entity = await this.usersRepository.findOne({ where: { provider, providerUserId } });
    return entity ? toUserRecord(entity) : null;
  }

  /**
   * Implementa o fluxo:
   * Procura usuário -> existe? login : cria conta automaticamente.
   */
  async findOrCreateFromOAuth(profile: OAuthProfileInput): Promise<{ user: UserRecord; isNewUser: boolean }> {
    const existingByProvider = await this.usersRepository.findOne({
      where: { provider: profile.provider, providerUserId: profile.providerUserId },
    });
    if (existingByProvider) {
      return { user: toUserRecord(existingByProvider), isNewUser: false };
    }

    // Mesmo e-mail já cadastrado via outro provider (ex.: local) -> vincula a conta
    // em vez de criar um registro duplicado.
    const existingByEmail = await this.usersRepository.findOne({ where: { email: profile.email } });
    if (existingByEmail) {
      existingByEmail.provider = existingByEmail.provider === 'local' ? existingByEmail.provider : profile.provider;
      existingByEmail.providerUserId = existingByEmail.providerUserId ?? profile.providerUserId;
      existingByEmail.name = existingByEmail.name || profile.name;
      existingByEmail.picture = existingByEmail.picture ?? profile.picture;
      existingByEmail.emailVerified = existingByEmail.emailVerified || profile.emailVerified;
      const saved = await this.usersRepository.save(existingByEmail);
      return { user: toUserRecord(saved), isNewUser: false };
    }

    const created = this.usersRepository.create({
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      emailVerified: profile.emailVerified,
      passwordHash: null,
      ageVerified: false,
    });
    const saved = await this.usersRepository.save(created);
    return { user: toUserRecord(saved), isNewUser: true };
  }

  async createLocalUser(input: LocalSignupInput): Promise<UserRecord> {
    const created = this.usersRepository.create({
      provider: 'local',
      providerUserId: null,
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      emailVerified: false,
      ageVerified: false,
    });
    const saved = await this.usersRepository.save(created);
    return toUserRecord(saved);
  }

  async touchLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { lastLoginAt: new Date() });
  }

  async markAgeVerified(userId: string, ageVerified: boolean): Promise<void> {
    await this.usersRepository.update({ id: userId }, { ageVerified });
  }
}
