# na-porta-orders-api

API REST para gerenciamento de pedidos da naPorta, construída com NestJS, TypeORM e PostgreSQL.

## Stack

- Node.js 20+
- NestJS
- TypeORM
- PostgreSQL 16
- Docker / Docker Compose

## Estratégia de banco de dados

O projeto usa a separação recomendada entre schema e dados de demonstração:

- PostgreSQL cria o database via `POSTGRES_DB` no Docker.
- TypeORM migrations criam e versionam o schema.
- O seed cria dados de demonstração de forma idempotente.

O seed padrão cria:

- 1 usuário admin
- 5 endereços
- 10 pedidos vinculados ao admin criado

Credenciais padrão do admin de demonstração:

- Email: `admin@na-porta.local`
- Senha: `Admin@123456`

## Executando com Docker

1. Copie o arquivo de exemplo de ambiente do Docker:

```bash
cp .env.docker.example .env.docker
```

2. Suba os containers:

```bash
docker compose --env-file .env.docker up --build
```

Fluxo automático no container da API:

- executa migrations
- executa seed demo quando `DB_SEED_DEMO=true`
- inicia a aplicação em `http://localhost:8080`

Swagger:

- `http://localhost:8080/api/docs`

## Executando localmente sem Docker

1. Copie o arquivo de ambiente da aplicação:

```bash
cp .env.example .env
```

2. Garanta que o PostgreSQL esteja disponível.

3. Instale as dependências:

```bash
npm install
```

4. Execute migrations e seed opcional:

```bash
npm run db:bootstrap
```

5. Inicie a aplicação:

```bash
npm run start:dev
```

## Scripts principais

```bash
# build
npm run build

# desenvolvimento
npm run start:dev

# lint sem corrigir
npm run lint:check

# prettier check
npm run format:check

# gerar migration
npm run migration:generate -- src/migrations/NomeDaMigration

# executar migrations
npm run migration:run

# reverter última migration
npm run migration:revert

# executar apenas o seed
npm run seed

# bootstrap completo do banco (migrations + seed se habilitado)
npm run db:bootstrap
```

## Variáveis de ambiente

### Aplicação local

Use `.env.example` como base.

Campos principais:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SYNCHRONIZE=false`
- `DB_SEED_DEMO=false`

### Docker local

Use `.env.docker.example` como base.

Campos principais:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DB_SEED_DEMO=true`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## CI

O workflow em `.github/workflows/ci.yml` executa:

- ESLint
- Prettier check
- build da aplicação
- bootstrap do banco com PostgreSQL de serviço
- build da imagem Docker

## Observações importantes

- `synchronize` fica desligado por padrão.
- O schema deve evoluir apenas via migrations.
- O seed foi pensado para ambiente local e demonstração, não para produção.
