/**
 * Contratos (tipos puros) compartilhados entre módulos.
 *
 * Nenhuma lógica de negócio vive aqui. Este arquivo existe para que
 * AuthenticationModule possa "falar" com UsersModule/SessionsModule/
 * AgeVerificationModule através do CommandBus/QueryBus do @nestjs/cqrs,
 * sem nunca importar os módulos concretos uns dos outros.
 */

export type AuthProvider = 'local' | 'google' | 'apple' | 'microsoft';

export interface UserRecord {
  id: string;
  provider: AuthProvider;
  providerUserId: string | null;
  email: string;
  passwordHash: string | null;
  name: string;
  picture: string | null;
  emailVerified: boolean;
  ageVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthProfileInput {
  provider: AuthProvider;
  providerUserId: string;
  email: string;
  name: string;
  picture: string | null;
  emailVerified: boolean;
}

export interface LocalSignupInput {
  email: string;
  name: string;
  passwordHash: string;
}
