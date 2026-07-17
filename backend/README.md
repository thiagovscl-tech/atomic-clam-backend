# Atomic Clam — Backend de Autenticação (NestJS)

Backend real, pronto para produção, implementando:

- Login com Email e Senha
- Login com Google OAuth 2.0 (Google Identity Services + Passport.js)
- Arquitetura preparada para Apple Sign In
- Verificação de idade desacoplada do login, com Providers por região
- Sessões com Access Token + Refresh Token (JWT)

## Arquitetura

```
src/
  authentication/     ← "quem é o usuário" (local, Google, Apple)
  authorization/       ← "o que o usuário pode fazer" (roles/guards)
  age-verification/   ← verificação de idade, com Providers por país
  sessions/            ← refresh tokens / sessões ativas
  users/               ← persistência da tabela `users`
  common/contracts/    ← tipos puros compartilhados entre módulos
```

**Nenhum desses 5 módulos importa o outro diretamente.** Eles se
comunicam exclusivamente através de `Commands`/`Queries` do
`@nestjs/cqrs` (`CommandBus` / `QueryBus`), usando apenas tipos definidos
em `common/contracts` (que não contêm lógica de negócio). A composição
de todos os módulos acontece só no topo, em `app.module.ts`.

Exceção deliberada e documentada: os *guards* de autenticação
(`JwtAuthGuard` etc.) definidos em `authentication/guards` são
importados como classes (não como módulo) por `age-verification` e por
futuros controllers que precisem saber "existe um usuário logado?".
Isso é acoplamento de tipo, não de módulo/DI, e é o padrão recomendado
pelo próprio NestJS para guards reutilizáveis.

## Fluxo do Google OAuth 2.0

Duas formas de integrar, ambas usando o mesmo `AuthenticationService`:

1. **Redirect clássico (Passport)**
   `GET /api/auth/google` → tela oficial do Google → `GET /api/auth/google/callback`
   (`passport-google-oauth20` troca o código pelos dados do perfil).

2. **Google Identity Services (GIS) no frontend, sem reload de página**
   O frontend renderiza o botão oficial do Google, recebe um `credential`
   (ID Token) e envia para `POST /api/auth/google/token`. O backend valida
   a assinatura/emissor/audience desse token com `google-auth-library`
   (nenhuma simulação).

Em ambos os casos:

```
Google valida o usuário
  → AuthenticationService.loginWithOAuthProfile(profile)
    → FindOrCreateUserCommand (Users)   // login ou criação automática de conta
    → TouchLastLoginCommand (Users)     // atualiza lastLoginAt
    → CreateSessionCommand (Sessions)   // access + refresh token
  → resposta inclui `ageVerified` e `next: "home" | "age"`
```

A tela de Verificação de Idade **não faz parte do login**: o frontend
decide para onde navegar (`home` ou `age`) olhando o campo `next`
retornado por qualquer rota de autenticação (`/auth/login`,
`/auth/signup`, `/auth/google/callback`, `/auth/google/token`).

## Verificação de idade — Providers

`POST /api/age-verification/verify` (requer access token) delega para
`AgeVerificationService`, que usa um `ProviderResolver` para escolher a
estratégia certa por país:

| País/Região | Provider          | Status                                   |
|-------------|-------------------|-------------------------------------------|
| Brasil (BR) | `BrazilProvider`  | Ativo (data de nascimento)                 |
| EUA (US)    | `USProvider`       | Ativo (data de nascimento + hook por estado) |
| UE          | `EUProvider`       | Placeholder (futura EUDI Wallet)           |
| Reino Unido | `UKProvider`       | Placeholder (futuro provedor Ofcom)        |
| Outros      | `BirthDateProvider`| Ativo (fallback universal)                 |
| —           | `ThirdPartyProvider`| Placeholder (Yoti/Veriff/Persona, etc.)   |

Providers "placeholder" lançam erro de propósito; o
`AgeVerificationService` captura e faz fallback automático para
`BirthDateProvider`, garantindo que o produto nunca fique indisponível
enquanto a integração regional definitiva não é contratada.

## Setup

```bash
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

### Google Cloud Console

1. Crie um **OAuth Client ID** do tipo "Web application".
2. Authorized redirect URI: `https://api.SEUDOMINIO.com/api/auth/google/callback`
3. Authorized JavaScript origin: `https://app.SEUDOMINIO.com` (para o GIS no frontend)
4. Copie `Client ID` e `Client secret` para `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` no `.env`.

### Habilitando Apple Sign In

Veja o passo a passo comentado em
`src/authentication/strategies/apple.strategy.stub.ts`. Nenhuma outra
parte do sistema precisa mudar: `AuthenticationService` já é agnóstico
de provider (`'local' | 'google' | 'apple'`).
