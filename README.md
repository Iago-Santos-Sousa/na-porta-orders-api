# na-porta-orders-api

API REST para gerenciamento de pedidos da naPorta, construída com NestJS, TypeORM e PostgreSQL.

**Aplicação publicada em produção:**

- API: https://na-porta-orders-api.onrender.com/api/status
- Swagger: https://na-porta-orders-api.onrender.com/api/docs
- Use o usuário padrão adicionado para se autenticar na API e utilizá-la com o Swagger:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

  Valores padrão dos arquivos de exemplo:
  - Nome: `Administrador naPorta`
  - email: `jhon.doe@gmail.com`
  - senha: `Admin@123456`

- Já existe alguns pedidos e endereços criados

## Índice

- [na-porta-orders-api](#na-porta-orders-api)
  - [Índice](#índice)
  - [Visão geral](#visão-geral)
  - [Stack e decisões técnicas](#stack-e-decisões-técnicas)
  - [Regras de negócio implementadas](#regras-de-negócio-implementadas)
    - [Pedidos](#pedidos)
    - [Usuários](#usuários)
    - [Endereços](#endereços)
  - [Entidades, tabelas e relacionamentos](#entidades-tabelas-e-relacionamentos)
    - [`User`](#user)
    - [`Address`](#address)
    - [`Order`](#order)
    - [`OrderItem`](#orderitem)
  - [Autenticação e autorização](#autenticação-e-autorização)
    - [JWT de acesso](#jwt-de-acesso)
    - [Refresh token com JWT](#refresh-token-com-jwt)
    - [Rotas públicas](#rotas-públicas)
    - [Permissões implementadas por role](#permissões-implementadas-por-role)
      - [`admin`](#admin)
      - [`user`](#user-1)
    - [Observação importante sobre permissões atuais](#observação-importante-sobre-permissões-atuais)
  - [Segurança implementada](#segurança-implementada)
  - [Swagger](#swagger)
  - [Testes automatizados](#testes-automatizados)
    - [Testes end-to-end HTTP](#testes-end-to-end-http)
  - [CI](#ci)
  - [Migrations e seed](#migrations-e-seed)
    - [Migrations](#migrations)
    - [Seed](#seed)
    - [Usuário admin padrão criado pela seed](#usuário-admin-padrão-criado-pela-seed)
  - [Execução local](#execução-local)
    - [Pré-requisitos](#pré-requisitos)
    - [Arquivo de ambiente](#arquivo-de-ambiente)
    - [Passo a passo](#passo-a-passo)
  - [Execução com Docker Compose](#execução-com-docker-compose)
  - [Deploy na Render](#deploy-na-render)
  - [Boas práticas adotadas](#boas-práticas-adotadas)
  - [Pontos de Clean Code identificáveis no projeto](#pontos-de-clean-code-identificáveis-no-projeto)
  - [Scripts principais](#scripts-principais)
  - [Observações finais](#observações-finais)

## Visão geral

O projeto foi estruturado por domínio, com módulos independentes para autenticação, usuários, endereços e pedidos. A aplicação expõe uma API REST com autenticação via JWT, refresh token também em JWT, documentação Swagger, versionamento de banco com migrations, seed idempotente para demonstração e validações automatizadas em CI.

## Stack e decisões técnicas

- Node.js 20+
- NestJS como framework principal da API
- TypeORM como ORM
- PostgreSQL 16 como banco relacional
- JWT para autenticação e renovação de sessão
- Swagger para documentação interativa
- Docker e Docker Compose para execução containerizada
- Jest e Supertest para testes automatizados
- ESLint e Prettier para qualidade estática do código

Principais decisões adotadas:

- Arquitetura modular por contexto de negócio: `auth`, `user`, `address` e `orders`.
- Separação de responsabilidades entre controller, service, repository, DTO e entity.
- Evolução de banco controlada por migration, sem depender de `synchronize` em runtime.
- Seed idempotente para demonstração local e ambientes de teste.
- Uso de transactions do TypeORM nas operações críticas de pedidos(manipulam mais de uma tabela).
- Validação global de entrada com `ValidationPipe` e serialização com `ClassSerializerInterceptor`.

## Regras de negócio implementadas

### Pedidos

- CRUD completo de pedidos.
- `order_id` em UUID.
- `order_number` sequencial e único no banco.
- `estimated_delivery_date` persistida como `date` no PostgreSQL.
- Relacionamento obrigatório com um endereço de entrega existente.
- Itens do pedido armazenados em tabela separada e vinculados ao pedido.
- Exclusão lógica(soft delete) com `deleted_at`.
- Filtros por:
  - número do pedido
  - status
  - período por `start_date` e `end_date`
- Datas da API aceitam formato `DD/MM/YYYY`.
- O filtro por período normaliza:
  - data inicial para `00:00:00`
  - data final para `23:59:59`
- Ao atualizar pedido com itens informados, os itens anteriores são removidos e recriados na mesma transação.
- Na criação do pedido, o usuário autenticado é gravado como autor em `created_by_user_id`.
- **Na atualização do pedido, existe regra de ownership: apenas admin ou o usuário que criou o pedido pode alterar o registro.**

### Usuários

- Cadastro público de usuário.
- Autenticação por email e senha.
- Persistência do refresh token de forma hasheada.
- Controle de role por `admin` e `user`.

### Endereços

- CRUD administrativo para endereços de entrega.
- Endereços são reutilizados por pedidos via relacionamento.

## Entidades, tabelas e relacionamentos

### `User`

Campos principais:

- `user_id`
- `name`
- `email`
- `password`
- `role`
- `refresh_token`
- `created_at`
- `updated_at`

Responsabilidade:

- armazenar credenciais, role e refresh token hash do usuário autenticado.

### `Address`

Campos principais:

- `address_id`
- `street`
- `number`
- `complement`
- `neighborhood`
- `city`
- `state`
- `zip_code`
- `created_at`
- `updated_at`

Responsabilidade:

- representar os endereços de entrega utilizados pelos pedidos.

### `Order`

Campos principais:

- `order_id`
- `order_number`
- `customer_name`
- `customer_document`
- `estimated_delivery_date`
- `status`
- `delivery_address_id`
- `created_by_user_id`
- `created_at`
- `updated_at`
- `deleted_at`

Relacionamentos:

- `Order` `N:1` `Address`
- `Order` `N:1` `User`
- `Order` `1:N` `OrderItem`

### `OrderItem`

Campos principais:

- `order_item_id`
- `description`
- `price`
- `created_at`
- `updated_at`

Relacionamento:

- cada item pertence a um pedido.

## Autenticação e autorização

### JWT de acesso

- O login retorna `access_token` e `refresh_token`.
- O `access_token` deve ser enviado no header `Authorization: Bearer <token>`.
- O guard também aceita `access_token` em cookie, quando presente.
- O payload inclui identificação do usuário, email, nome e roles.

### Refresh token com JWT

- O `refresh_token` também é um JWT assinado.
- Pode ser enviado no corpo da requisição ou via cookie `refresh_token`.
- Antes de renovar a sessão, o token é validado contra o hash persistido no banco.
- Ao renovar, um novo par de tokens é emitido e o hash do refresh token é atualizado.
- No logout, o refresh token persistido do usuário é invalidado.

### Rotas públicas

- `POST /api/users`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`

### Permissões implementadas por role

#### `admin`

- pode acessar todo o CRUD de endereços
- pode listar usuários paginados
- pode listar todos os usuários em `/api/users/all`
- pode excluir usuários
- pode atualizar qualquer usuário, inclusive alterar role
- pode atualizar qualquer pedido
- pode excluir qualquer pedido
- também pode executar todas as ações disponíveis para usuários autenticados

#### `user`

- pode autenticar, renovar token e fazer logout
- pode criar pedidos
- pode listar pedidos
- pode consultar pedido por id
- pode excluir apenas pedidos próprios
- pode consultar usuário por id
- pode atualizar apenas o próprio usuário autenticado
- pode atualizar apenas pedidos próprios

### Observação importante sobre permissões atuais

As permissões acima descrevem exatamente o comportamento implementado hoje. Em especial:

- o controle de ownership está aplicado na atualização e exclusão de pedidos
- a atualização de usuário permite que `admin` altere qualquer usuário
- a atualização de usuário permite que `user` altere apenas o próprio registro
- a alteração de role em usuários fica restrita a administradores

## Segurança implementada

- JWT para autenticação de acesso.
- Refresh token com assinatura própria e segredo separado.
- Refresh token persistido como hash, não em texto puro.
- `helmet` habilitado globalmente para adicionar headers de segurança HTTP.
- `ThrottlerGuard` global para rate limiting.
- Limite configurado em `10` requisições por `60` segundos por cliente.
- `ValidationPipe` global com:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
- Uso de DTOs com `class-validator` e `class-transformer`.
- Serialização com `ClassSerializerInterceptor` para ocultar campos internos, como `created_by_user_id` e `deleted_at` dos pedidos.
- `ParseUUIDPipe` e `ParseIntPipe` para validação de parâmetros de rota.
- Uso de secrets independentes para access token e refresh token.
- Banco evoluído por migrations, evitando alteração implícita de schema em runtime.

## Swagger

Documentação interativa disponível em:

- local: `http://localhost:8080/api/docs`
- produção: https://na-porta-orders-api.onrender.com/api/docs

O Swagger foi configurado com:

- tags por domínio: `auth`, `users`, `orders`, `addresses`
- schema Bearer JWT para autenticação
- exemplos e contratos dos DTOs
- documentação dos endpoints principais

Como usar:

1. Execute a API.
2. Acesse `/api/docs`.
3. Faça login em `POST /api/auth/login`.
4. Copie o `access_token` retornado.
5. Clique em `Authorize` no Swagger e informe `Bearer <access_token>`.
6. Teste os endpoints protegidos diretamente pela interface.

## Testes automatizados

O projeto possui dois grupos principais de testes.

### Testes end-to-end HTTP

Arquivos em `test/*.e2e-spec.ts`.

Objetivo:

- validar o comportamento HTTP dos principais endpoints da API
- cobrir entrada, validação, status code e formato de resposta
- testar a camada web com controllers reais e services mockados

Suítes atuais:

- `test/app.e2e-spec.ts`
- `test/auth.e2e-spec.ts`
- `test/users.e2e-spec.ts`
- `test/addresses.e2e-spec.ts`
- `test/orders.e2e-spec.ts`

Execução:

```bash
npm run test:e2e
```

## CI

O projeto possui workflow em `.github/workflows/ci.yml`, executado em `push` e `pull_request` para `main` e `develop`.

Validações automatizadas:

- `npm ci`
- `npm run lint:check`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e -- --runInBand`

Isso garante lint com ESLint, consistência de formatação com Prettier, compilação da aplicação e verificação dos fluxos HTTP principais.

## Migrations e seed

### Migrations

O schema do banco é versionado por migrations do TypeORM.

Comandos principais:

```bash
npm run migration:run
npm run migration:revert
npm run migration:generate -- src/migrations/NomeDaMigration
```

### Seed

O projeto possui seed idempotente para demonstração.

Comando dedicado:

```bash
npm run seed
```

Bootstrap completo do banco:

```bash
npm run db:bootstrap
```

Comportamento do bootstrap:

- executa todas as migrations pendentes
- executa a seed apenas quando `DB_SEED_DEMO=true`

### Usuário admin padrão criado pela seed

A seed cria ou atualiza um usuário administrador padrão com base nas variáveis de ambiente:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Valores padrão dos arquivos de exemplo:

- Nome: `Administrador naPorta`
- email: `jhon.doe@gmail.com`
- senha: `Admin@123456`

Além do admin padrão, a seed também cria dados fictícios para demonstração:

- 5 endereços
- 10 pedidos com itens vinculados

## Execução local

### Pré-requisitos

- Node.js 20+
- npm
- PostgreSQL disponível localmente

### Arquivo de ambiente

Use `.env.docker.example ou .env.example ou o que você preferir` como base para `.env`.

Variáveis mais importantes:

- `APP_PORT`: porta HTTP da aplicação
- `DB_HOST`: host do PostgreSQL
- `DB_PORT`: porta do PostgreSQL
- `DB_USER`: usuário do banco
- `DB_PASSWORD`: senha do banco
- `DB_NAME`: nome do database
- `DB_SCHEMA`: compatibilidade com ambientes que usam esse nome como fallback de database
- `DB_CONNECTION_LIMIT`: limite do pool de conexões
- `DB_SYNCHRONIZE`: deve permanecer `false`
- `DB_SSL`: habilita SSL do TypeORM
- `DB_SEED_DEMO`: controla execução automática do seed no bootstrap
- `ADMIN_EMAIL`: email do admin da seed
- `ADMIN_PASSWORD`: senha do admin da seed
- `JWT_SECRET`: segredo do access token
- `JWT_REFRESH_SECRET`: segredo do refresh token
- `JWT_EXPIRES`: expiração do access token
- `JWT_REFRESH_EXPIRES`: expiração do refresh token

### Passo a passo

1. Instale as dependências.

```bash
npm install
```

2. Crie o `.env` a partir do `.env.example`.

3. Garanta que o PostgreSQL esteja acessível com as credenciais configuradas.

4. Execute o bootstrap do banco.

```bash
npm run db:bootstrap
```

5. Suba a API em modo desenvolvimento.

```bash
npm run start:dev
```

Endereços locais:

- API: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/api/docs`

## Execução com Docker Compose

Use `.env.docker.example ou .env.example ou o que você preferir` como base para `.env`.

Variáveis adicionais importantes nesse fluxo:

- `POSTGRES_PORT`: porta exposta do container PostgreSQL
- `DB_HOST=postgres`: nome do serviço no Compose
- `DB_SEED_DEMO=true`: recomendado para subir ambiente demo completo

Passo a passo:

1. Crie o arquivo `.env.docker` a partir de `.env.docker.example`.
2. Suba os containers.

```bash
docker compose --env-file .env.docker up --build
```

Fluxo do container da API:

- executa `npm run db:bootstrap:prod`
- aplica migrations
- roda seed quando `DB_SEED_DEMO=true`
- inicia a API com `npm run start:prod`

Endereços:

- API: `http://localhost:8080/api`
- Swagger: `http://localhost:8080/api/docs`

## Deploy na Render

Deploy ativo em:

- https://na-porta-orders-api.onrender.com/

Observações:

- a documentação Swagger em produção fica em `/api/docs`
- a aplicação utiliza o mesmo conjunto principal de variáveis de ambiente usado localmente
- a imagem/container executa bootstrap de banco antes de subir a aplicação em modo produção

## Boas práticas adotadas

- organização por módulos de negócio
- controllers finos e services centralizando regra de negócio
- DTOs para entrada e saída
- tipagem explícita com TypeScript
- enums para status e roles
- repository layer para consultas específicas
- transactions para operações com múltiplas entidades
- serialização para não expor campos internos
- migrations em vez de schema implícito
- seed idempotente e previsível
- documentação Swagger próxima da implementação
- testes automatizados separados por tipo
- CI para evitar regressões simples de qualidade

## Pontos de Clean Code identificáveis no projeto

- nomes de classes, métodos e DTOs refletem a intenção do negócio
- divisão clara entre responsabilidade HTTP, regra de negócio e acesso a dados
- extração de métodos pequenos para regras específicas, como normalização de filtros e validação de ownership em pedidos
- reaproveitamento de componentes comuns, como paginação, decorators e utilitários de data
- código orientado a contratos com DTOs e tipos auxiliares em vez de objetos soltos
- centralização das regras de autenticação no módulo `auth`
- compartilhamento do setup dos testes e2e em `test/http-test-app.helper.ts`

## Scripts principais

```bash
# build
npm run build

# desenvolvimento
npm run start:dev
npm run start:debug

# qualidade
npm run lint:check
npm run format:check

# testes
npm test
npm run test:cov
npm run test:e2e

# banco
npm run migration:run
npm run migration:revert
npm run seed
npm run db:bootstrap
```

## Observações finais

- `DB_SYNCHRONIZE` deve permanecer desabilitado nos ambientes normais do projeto.
- O seed foi pensado para demonstração e aceleração do setup inicial.
- O admin criado pela seed é o ponto de entrada recomendado para validar o fluxo completo da aplicação e navegar pelas rotas protegidas via Swagger.
