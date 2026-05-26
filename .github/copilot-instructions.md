# Instruções do Projeto

## Stack

- Backend - appolo-api: Node.js + TypeScript + Nestjs + TypeORM + PostgreSQL.
- Banco de dados: PostgreSQL com TypeORM.

## Convenções

- Use async/await em vez de .then().
- Variáveis em camelCase, constantes em UPPER_SNAKE_CASE.
- Sempre use transactions do TypeORM para operações que envolvem múltiplas etapas ou múltiplas entidades. Transações síncronas com async e await.
- Nome dos campos/colunas das entidades/banco de dados em snake_case, nome das variáveis e funções em camelCase.
- Sempre analise o package.json para verificar as dependências e scripts disponíveis antes de adicionar novas dependências ou criar novos scripts.
- Siga as convenções de estrutura de pastas e organização de código do Nestjs, como usar módulos, controladores, documentações, serviços e repositórios para organizar o código de forma modular e escalável.
- Sempre tente implemeneter as features ou ajustes com a melhor tipagem do TypeScript possível, evitando o uso de "any" e preferindo tipos específicos e genéricos quando necessário.
- Ignore erros de lint e formatação para não gastar tokens de forma desnecessária.
