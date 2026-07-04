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

Todas as rotas em `/api`, exceto `/api/auth/login`, exigem um token JWT (`Authorization: Bearer <token>`) obtido através do login de um usuário administrador.

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
* Nodemailer
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

### Usuario (administrador do painel)

* id
* nome
* email
* senha (hash bcrypt, nunca devolvida pela API)
* createdAt

### Cliente

* id
* nome
* cpf
* email
* senha (hash bcrypt, nunca devolvida pela API)
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

A API está disponível publicamente através do Render:

**API Base URL**

[Sistema Bancário Digital API](https://sistema-banco-digital-1.onrender.com)

Todas as rotas descritas nesta documentação utilizam o prefixo:

```text
https://sistema-banco-digital-1.onrender.com/api
```

Exemplo:

```http
GET https://sistema-banco-digital-1.onrender.com/api/clientes
```

---

# 🚀 Acesso Rápido

## API em Produção

```text
https://sistema-banco-digital-1.onrender.com
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
GET https://sistema-banco-digital-1.onrender.com/api/clientes
```

## Buscar Cliente por ID

```http
GET https://sistema-banco-digital-1.onrender.com/api/clientes/1
```

## Criar Cliente

```http
POST https://sistema-banco-digital-1.onrender.com/api/clientes
Content-Type: application/json

{
    "nome": "João Silva",
    "cpf": "12345678900",
    "email": "joao@email.com",
    "senha": "123456"
}
```

---

# ☁️ Deploy

O backend encontra-se hospedado na plataforma Render.

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
JWT_EXPIRES_IN=8h

EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password
```

Gerar Prisma Client:

```bash
npx prisma generate
```

Executar migrations:

```bash
npx prisma migrate dev
```

Popular banco (cria também o usuário administrador `admin@banco.com` / `admin123` — troque a senha em produção):

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

## Autenticação

| Método | Endpoint                  |
| ------ | ------------------------- |
| POST   | /api/auth/login           |
| POST   | /api/auth/esqueci-senha   |
| POST   | /api/auth/redefinir-senha |

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "admin@banco.com",
    "senha": "admin123"
}
```

Resposta inclui uma mensagem de boas-vindas com a data do último acesso (ou aviso de primeiro
acesso), além do token e do nível do usuário. Após 3 tentativas de senha inválida, o usuário fica
bloqueado por 15 minutos (`423 Locked`).

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

## Usuários (administradores do painel)

| Método | Endpoint      |
| ------ | ------------- |
| GET    | /api/usuarios |
| POST   | /api/usuarios |

A senha deve ter no mínimo 8 caracteres, com letra minúscula, maiúscula, número e símbolo. Não é
permitido cadastrar dois usuários com o mesmo e-mail. Excluir clientes ou contas exige um usuário
de **nível 3** (`403 Forbidden` caso contrário); veja `ADMIN_NIVEL` em
[backend/prisma/createAdmin.ts](backend/prisma/createAdmin.ts).

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

# ✨ Funcionalidades

* Cadastro de clientes
* Gerenciamento de contas bancárias
* Controle de cartões
* Gestão de empréstimos
* Operações financeiras
* Transferências entre contas
* Histórico de transações
* Relatórios por e-mail
* Autenticação de administrador via JWT
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

* Autenticação via JWT em todas as rotas administrativas (`/api/*`, exceto `/api/auth`)
* Senhas de clientes e do usuário administrador com hash bcrypt (nunca gravadas ou devolvidas em texto puro)
* Validação de senha forte (mínimo 8 caracteres, minúscula, maiúscula, número e símbolo) na
  criação de usuários administradores
* Bloqueio de conta por 15 minutos após 3 tentativas de login inválidas
* Registro de data/hora do último login, exibida na resposta do login
* Níveis de acesso por usuário (`nivel` 1-3): exclusão de clientes/contas exige nível 3
* Recuperação de senha por e-mail com código temporário de 6 dígitos (expira em 15 minutos)
* Tabela de `Log` registrando login (sucesso/falha/bloqueio), criação de usuário, recuperação e
  redefinição de senha e exclusões de clientes/contas
* CVV de cartão nunca é devolvido pela API
* Validação de toda entrada da API com Zod
* Rate limiting no login e nas operações financeiras (depósito, saque, transferência)
* Headers de segurança via Helmet
* Arquivos `.env` protegidos via `.gitignore`
* Variáveis de ambiente validadas na inicialização (falha rápido se algo estiver faltando)
* ORM Prisma para evitar SQL Injection
* Separação entre frontend e backend
* Controle de relacionamentos por chaves estrangeiras

---

# 👨‍💻 Autor

**Ramiro Quevedo Paz**

Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)

Disciplina: Desenvolvimento de Serviços e APIs

Professor: Edécio Fernando Iepsen

Universidade / Instituição: SENAC
