import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SessionEntity } from './session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
  ) {}

  async create(params: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<SessionEntity> {
    const refreshTokenHash = await bcrypt.hash(params.refreshToken, 12);
    const entity = this.sessionsRepository.create({
      userId: params.userId,
      refreshTokenHash,
      userAgent: params.userAgent ?? null,
      ipAddress: params.ipAddress ?? null,
      expiresAt: params.expiresAt,
      revokedAt: null,
    });
    return this.sessionsRepository.save(entity);
  }

  async findValidByUser(userId: string): Promise<SessionEntity[]> {
    return this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .andWhere('session.revokedAt IS NULL')
      .andWhere('session.expiresAt > NOW()')
      .getMany();
  }

  async matchRefreshToken(userId: string, refreshToken: string): Promise<SessionEntity | null> {
    const sessions = await this.findValidByUser(userId);
    for (const session of sessions) {
      const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (matches) return session;
    }
    return null;
  }

  async revoke(sessionId: string): Promise<void> {
    await this.sessionsRepository.update({ id: sessionId }, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.sessionsRepository
      .createQueryBuilder()
      .update(SessionEntity)
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();
  }
}
