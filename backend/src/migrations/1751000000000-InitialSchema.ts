import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1751000000000 implements MigrationInterface {
  name = 'InitialSchema1751000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "provider" varchar(16) NOT NULL DEFAULT 'local',
        "providerUserId" varchar(128),
        "email" varchar(320) NOT NULL,
        "passwordHash" varchar,
        "name" varchar(160) NOT NULL,
        "picture" varchar,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "ageVerified" boolean NOT NULL DEFAULT false,
        "lastLoginAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_users_provider_providerUserId"
      ON "users" ("provider", "providerUserId")
      WHERE "providerUserId" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "refreshTokenHash" varchar NOT NULL,
        "userAgent" varchar,
        "ipAddress" varchar,
        "revokedAt" timestamptz,
        "expiresAt" timestamptz NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sessions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_userId" ON "sessions" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
