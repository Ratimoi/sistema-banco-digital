# 🏦 Sistema Bancário Digital

Sistema completo de gerenciamento bancário desenvolvido com arquitetura Full Stack, composto por uma API REST em Node.js/Express e uma interface web em React.

O projeto permite o gerenciamento de clientes, contas bancárias, cartões, empréstimos e transações financeiras, seguindo boas práticas de desenvolvimento, persistência de dados e integração entre frontend e backend.

---

# 📋 Sumário

* Sobre o Projeto
* Arquitetura
* Tecnologias Utilizadas
* Estrutura do Projeto
* Modelo de Dados
* Configuração do Ambiente
* Execução com Docker
* Ambiente de Produção
* Acesso Rápido
* Exemplos de Requisição
* Deploy
* Execução Local
* Banco de Dados
* Rotas da API
* Funcionalidades
* CI/CD
* Segurança
* Autor

---

# 📖 Sobre o Projeto

O Sistema Bancário Digital foi desenvolvido como projeto acadêmico da disciplina de Desenvolvimento de Serviços e APIs.

A aplicação simula operações bancárias reais, permitindo:

* Cadastro de clientes
* Abertura de contas
* Emissão de cartões
* Solicitação de empréstimos
* Depósitos
* Saques
* Transferências entre contas
* Consulta de histórico de transações
* Envio de relatórios por e-mail

---

# 🏗️ Arquitetura

```text
┌───────────────┐
│   Frontend    │
│ React + Vite  │
└───────┬───────┘
        │ HTTP/REST
        ▼
┌───────────────┐
│    Backend    │
│ Node + Express│
└───────┬───────┘
        │ Prisma ORM
        ▼
┌───────────────┐
│  PostgreSQL   │
│ Banco Dados   │
└───────────────┘
```

Existe um único modelo de conta (`Cliente`) e um único login (`/api/auth/login`). A
conta possui um campo `nivel` (0 = cliente comum, 1-3 = equipe do banco — a
"credencial especial"). Rotas em `/api/*` (gestão administrativa) exigem um token
JWT válido **e** `nivel >= 1`; rotas em `/api/cliente/*` (autoatendimento) exigem
apenas um token válido, de qualquer nível.

---

# ⚙️ Tecnologias Utilizadas

## Backend

* Node.js
* TypeScript
* Express 5
* Prisma ORM
* PostgreSQL
* Zod (validação de dados)
* JWT + bcrypt (autenticação)
* Helmet + CORS + express-rate-limit (segurança)
* Vitest + Supertest (testes)
* Resend (e-mail transacional)
* Docker

## Frontend

* React 18
* TypeScript
* Vite
* Axios
* React Router DOM

## DevOps

* Docker
* Docker Compose
* GitHub Actions

---

# 📁 Estrutura do Projeto

```text
sistema_banco/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── config/       # validação de variáveis de ambiente (zod)
│   │   ├── lib/          # cliente Prisma
│   │   ├── schemas/      # validação de entrada (zod) por recurso
│   │   ├── middlewares/  # auth (JWT), validate, errorHandler
│   │   ├── services/     # regra de negócio + acesso ao Prisma
│   │   ├── controllers/  # finos: parseiam a requisição e chamam o service
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   │
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
└── README.md
```

---

# 🗄️ Modelo de Dados

```text
Cliente (1) ──────── (N) Conta
   │                       │
   └── (N) Emprestimo      ├── (N) Cartao
                           └── (N) Transacao
```

## Entidades

### Cliente

* id
* nome
* cpf
* email
* senha (hash bcrypt, nunca devolvida pela API)
* nivel (0 = cliente comum, 1-3 = equipe do banco — concedido por um administrador nível 3 ao editar o cliente)
* createdAt

### Conta

* id
* numeroConta
* saldo (Decimal)
* tipo
* clienteId

### Cartão

* id
* numero
* validade
* cvv (nunca devolvido pela API)
* tipo
* contaId

### Empréstimo

* id
* valor (Decimal)
* taxaJuros (Decimal)
* parcelas
* status
* clienteId

### Transação

* id
* tipo
* valor (Decimal)
* descricao
* contaOrigemId
* contaDestinoId
* createdAt

### Post (Comunidade)

* id
* conteudo
* midiaUrl (opcional — url pública do Supabase Storage)
* midiaTipo (opcional — `"imagem"` ou `"video"`)
* clienteId
* createdAt (usado para apagar publicações com mais de 30 dias automaticamente)

---

# 🚀 Configuração do Ambiente

## Pré-requisitos

* Node.js 20+
* Docker
* Docker Compose
* PostgreSQL 16+ (local via Docker ou um provedor como Supabase)

---

# 🐳 Execução com Docker

## Subir todos os serviços

```bash
docker compose up -d --build
```

## Verificar containers

```bash
docker ps
```

## Derrubar containers

```bash
docker compose down
```

---

# 🌐 Ambiente de Produção

Frontend e backend estão hospedados em dois serviços separados no Render:

**Frontend (aplicação web)**

[Sistema Bancário Digital](https://sistema-banco-digital-1.onrender.com)

**Backend (API)**

[Sistema Bancário Digital API](https://sistema-banco-digital.onrender.com)

Todas as rotas descritas nesta documentação utilizam o prefixo:

```text
https://sistema-banco-digital.onrender.com/api
```

Exemplo:

```http
GET https://sistema-banco-digital.onrender.com/api/clientes
```

---

# 🚀 Acesso Rápido

## Frontend em Produção

```text
https://sistema-banco-digital-1.onrender.com
```

## API em Produção

```text
https://sistema-banco-digital.onrender.com
```

## Frontend Local

```text
http://localhost:5173
```

## Backend Local

```text
http://localhost:3000
```

---

# 📡 Exemplos de Requisição

## Listar Clientes

```http
GET https://sistema-banco-digital.onrender.com/api/clientes
```

## Buscar Cliente por ID

```http
GET https://sistema-banco-digital.onrender.com/api/clientes/1
```

## Criar Cliente

```http
POST https://sistema-banco-digital.onrender.com/api/clientes
Content-Type: application/json

{
    "nome": "João Silva",
    "cpf": "12345678900",
    "email": "joao@email.com",
    "senha": "SenhaForte123!"
}
```

---

# ☁️ Deploy

Frontend e backend são dois serviços independentes no Render (o frontend é um static
site, o backend um web service Node).

Principais características do ambiente:

* Deploy automático a cada push na branch `main` (Render observa o repositório diretamente)
* Pipeline de CI (lint, build e testes) roda via GitHub Actions em cada pull request para `main`
* Banco de dados PostgreSQL (Supabase)
* Disponibilidade pública via HTTPS
* Certificado SSL automático

Caso a aplicação fique inativa por longos períodos, o primeiro acesso pode apresentar um pequeno tempo de inicialização devido ao plano gratuito do Render.

---

# 💻 Execução Local

## Backend

```bash
cd backend

npm install
```

Criar arquivo `.env` (veja `backend/.env.example`):

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/api_banco"

JWT_SECRET=troque_por_um_segredo_aleatorio_longo
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

RESEND_API_KEY=re_sua_chave
```

Gerar Prisma Client:

```bash
npx prisma generate
```

Executar migrations:

```bash
npx prisma migrate dev
```

Popular banco (cria também a conta de equipe `admin@banco.com` / `SenhaForte123!`, nível 3 — troque a senha em produção):

```bash
npx prisma db seed
```

Executar servidor:

```bash
npm run dev
```

Rodar lint, formatação e testes:

```bash
npm run lint
npm run format
npm run test
```

Backend disponível em:

```text
http://localhost:3000
```

---

## Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend disponível em:

```text
http://localhost:5173
```

---

# 📌 Endpoints da API

Todos os endpoints abaixo, exceto os de `/api/auth`, exigem o header
`Authorization: Bearer <token>` obtido no login.

As listagens de clientes, contas, cartões, empréstimos e transações aceitam `?page=` e `?limit=`
(padrão 1 e 20, máximo 100) e devolvem `{ dados, total, pagina, totalPaginas }` em vez de um array
sem limite.

## Dashboard

| Método | Endpoint             |
| ------ | --------------------- |
| GET    | /api/dashboard/stats |

Retorna contagens agregadas (clientes, contas, transações, empréstimos, saldo total) e as 5
transações mais recentes, sem precisar carregar as tabelas inteiras no cliente.

## Autenticação

| Método | Endpoint                  |
| ------ | ------------------------- |
| POST   | /api/auth/login           |
| POST   | /api/auth/refresh         |
| POST   | /api/auth/esqueci-senha   |
| POST   | /api/auth/redefinir-senha |

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "admin@banco.com",
    "senha": "SenhaForte123!"
}
```

Resposta inclui uma mensagem de boas-vindas com a data do último acesso (ou aviso de primeiro
acesso), além do `token` (access token, expira em 1h), do `refreshToken` (expira em 7 dias) e do
`nivel` da conta. Após 3 tentativas de senha inválida, a conta fica bloqueada por 15 minutos
(`423 Locked`).

```http
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }
```

Emite um novo `token` (access token) a partir de um `refreshToken` válido, sem exigir login de
novo. O frontend chama esse endpoint automaticamente sempre que uma requisição autenticada recebe
`401`, e só desloga o usuário se a renovação também falhar.

```http
POST /api/auth/esqueci-senha
Content-Type: application/json

{ "email": "admin@banco.com" }
```

Envia um código de 6 dígitos por e-mail, válido por 15 minutos. A resposta é sempre genérica
(não revela se o e-mail existe).

```http
POST /api/auth/redefinir-senha
Content-Type: application/json

{ "email": "admin@banco.com", "codigo": "123456", "novaSenha": "SenhaForte123!" }
```

A senha deve ter no mínimo 8 caracteres, com letra minúscula, maiúscula, número e símbolo. Não é
permitido cadastrar dois clientes com o mesmo e-mail. Excluir clientes, contas, cartões ou
empréstimos exige nível 3; aprovar/rejeitar empréstimos exige nível 2 (`403 Forbidden` caso
contrário). A primeira conta de equipe é criada via
`ADMIN_EMAIL`/`ADMIN_SENHA`/`ADMIN_CPF`/`ADMIN_NIVEL` em
[backend/prisma/createAdmin.ts](backend/prisma/createAdmin.ts); contas adicionais recebem a
credencial editando o campo "Nível" na tela de Clientes do painel.

### Cadastro (autoatendimento)

| Método | Endpoint         |
| ------ | ---------------- |
| POST   | /api/auth/cadastro |

```http
POST /api/auth/cadastro
Content-Type: application/json

{
    "nome": "Maria Silva",
    "cpf": "98765432100",
    "email": "maria@email.com",
    "senha": "SenhaForte123!",
    "tipoConta": "corrente"
}
```

Cria o `Cliente` (nível 0) e a `Conta` associada em uma única chamada — usado pela tela pública de
cadastro do portal (`/cadastro`), sem exigir autenticação.

## Clientes

| Método | Endpoint                |
| ------ | ----------------------- |
| GET    | /api/clientes           |
| GET    | /api/clientes/:id       |
| POST   | /api/clientes           |
| PUT    | /api/clientes/:id       |
| DELETE | /api/clientes/:id       |
| GET    | /api/clientes/:id/email |

---

## Contas

| Método | Endpoint                       |
| ------ | ------------------------------ |
| GET    | /api/contas                    |
| GET    | /api/contas/:id                |
| GET    | /api/contas/cliente/:clienteId |
| POST   | /api/contas                    |
| PUT    | /api/contas/:id                |
| DELETE | /api/contas/:id                |

---

## Transações

| Método | Endpoint                      |
| ------ | ----------------------------- |
| GET    | /api/transacoes               |
| GET    | /api/transacoes/:id           |
| POST   | /api/transacoes/deposito      |
| POST   | /api/transacoes/saque         |
| POST   | /api/transacoes/transferencia |

---

## Empréstimos

| Método | Endpoint             |
| ------ | -------------------- |
| GET    | /api/emprestimos     |
| GET    | /api/emprestimos/:id |
| POST   | /api/emprestimos     |
| PUT    | /api/emprestimos/:id |
| DELETE | /api/emprestimos/:id |

---

## Cartões

| Método | Endpoint         |
| ------ | ---------------- |
| GET    | /api/cartoes     |
| GET    | /api/cartoes/:id |
| POST   | /api/cartoes     |
| PUT    | /api/cartoes/:id |
| DELETE | /api/cartoes/:id |

---

## Comunidade

Mural de publicações entre clientes. Montado tanto em `/api/comunidade` (nível 1+, painel
administrativo) quanto em `/api/cliente/comunidade` (qualquer conta autenticada, portal do
cliente) — os mesmos posts aparecem nos dois lugares.

| Método | Endpoint            | Nível exigido        |
| ------ | ------------------- | --------------------- |
| GET    | /comunidade          | 0 (qualquer conta)     |
| POST   | /comunidade          | 0 (qualquer conta)     |
| POST   | /comunidade/upload   | 0 (qualquer conta)     |
| DELETE | /comunidade/:id      | 1+ (moderação)         |

```http
POST /api/cliente/comunidade/upload
Content-Type: multipart/form-data

arquivo: <imagem ou vídeo, até 25MB>
```

Envia o arquivo para o Supabase Storage e retorna `{ url, tipo }` (`tipo` é `"imagem"` ou
`"video"`), usado no campo `midiaUrl`/`midiaTipo` do `POST /comunidade` seguinte. Limitado a
10 requisições/minuto por IP. Links (`https://...`) viram texto clicável e `@nome` fica
destacado visualmente no conteúdo do post — sem gerar notificação nem vínculo no banco.

Publicações com mais de 30 dias (e a mídia associada, se houver) são apagadas automaticamente a
cada listagem do mural, sem precisar de um cron.

---

## Portal do Cliente (autoatendimento)

Rotas em `/api/cliente/*` exigem apenas um token válido (qualquer `nivel`) — usadas pelo
painel de autoatendimento do próprio cliente em `/portal/*`.

| Método | Endpoint                          |
| ------ | --------------------------------- |
| GET    | /api/cliente/minha-conta          |
| GET    | /api/cliente/cartoes              |
| POST   | /api/cliente/cartoes              |
| GET    | /api/cliente/transacoes           |
| POST   | /api/cliente/transacoes/saque     |
| POST   | /api/cliente/transacoes/transferencia |
| GET    | /api/cliente/emprestimos          |
| POST   | /api/cliente/emprestimos          |
| GET    | /api/cliente/comunidade           |
| POST   | /api/cliente/comunidade           |
| POST   | /api/cliente/comunidade/upload    |

Saque e transferência identificam a conta pelo número do cartão informado (saque só aceita cartão
de débito, com validação de saldo). Empréstimo solicitado via cartão de crédito é validado contra o
limite do cartão e fica pendente até um membro da equipe aprovar ou rejeitar (nível 2+) — só então
o valor é creditado na conta.

---

# ✨ Funcionalidades

* Cadastro de clientes
* Gerenciamento de contas bancárias
* Controle de cartões
* Gestão de empréstimos
* Operações financeiras
* Transferências entre contas
* Histórico de transações
* Relatórios por e-mail
* Portal de autoatendimento do cliente (conta, cartões, transações, empréstimo via crédito, mural
  de comunidade)
* Autenticação unificada via JWT, com nível de permissão por conta
* Persistência em banco de dados PostgreSQL
* API RESTful
* Interface Web Responsiva

---

# 🔄 Integração Contínua (CI/CD)

O projeto possui pipeline automatizada utilizando GitHub Actions.

As verificações incluem:

* Instalação de dependências
* Lint (ESLint) do backend
* Build do frontend e do backend (com verificação de tipos TypeScript)
* Execução dos testes automatizados (Vitest) do backend

---

# 🔒 Segurança

* Autenticação via JWT única para toda a aplicação; rotas administrativas (`/api/*`, exceto
  `/api/auth`) exigem além do token um `nivel >= 1` na conta
* Senhas com hash bcrypt (nunca gravadas ou devolvidas em texto puro) e validação de senha forte
  (mínimo 8 caracteres, minúscula, maiúscula, número e símbolo) em toda criação/redefinição
* Bloqueio de conta por 15 minutos após 3 tentativas de login inválidas
* Registro de data/hora do último login, exibida na resposta do login
* Níveis de acesso por conta (`nivel` 0-3): 0 é cliente comum, 1-3 é equipe do banco; exclusão de
  clientes/contas/cartões/empréstimos exige nível 3, aprovação/rejeição de empréstimos exige
  nível 2
* Recuperação de senha por e-mail com código temporário de 6 dígitos (expira em 15 minutos)
* Tabela de `Log` registrando login (sucesso/falha/bloqueio), recuperação e redefinição de senha e
  exclusões de clientes/contas
* CVV de cartão nunca é devolvido pela API
* Validação de toda entrada da API com Zod
* Rate limiting no login e nas operações financeiras (depósito, saque, transferência)
* Headers de segurança via Helmet
* Arquivos `.env` protegidos via `.gitignore`
* Variáveis de ambiente validadas na inicialização (falha rápido se algo estiver faltando)
* ORM Prisma para evitar SQL Injection
* Índice nas colunas de chave estrangeira (Postgres não cria automaticamente, diferente do MySQL)
* Separação entre frontend e backend
* Controle de relacionamentos por chaves estrangeiras

---

# 👨‍💻 Autor

**Ramiro Quevedo Paz**

Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)

Disciplina: Desenvolvimento de Serviços e APIs

Professor: Edécio Fernando Iepsen

Universidade / Instituição: SENAC
