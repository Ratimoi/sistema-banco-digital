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
│    MySQL      │
│ Banco Dados   │
└───────────────┘
```

---

# ⚙️ Tecnologias Utilizadas

## Backend

* Node.js
* TypeScript
* Express 5
* Prisma ORM
* MySQL
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
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middlewares/
│   │   └── server.ts
│   │
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
* senha
* createdAt

### Conta

* id
* numeroConta
* saldo
* tipo
* clienteId

### Cartão

* id
* numero
* validade
* cvv
* tipo
* contaId

### Empréstimo

* id
* valor
* taxaJuros
* parcelas
* status
* clienteId

### Transação

* id
* tipo
* valor
* descricao
* contaOrigemId
* contaDestinoId
* createdAt

---

# 🚀 Configuração do Ambiente

## Pré-requisitos

* Node.js 18+
* Docker
* Docker Compose
* MySQL 8+

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

[Sistema Bancário Digital API](https://sistema-banco-digital-1.onrender.com?utm_source=chatgpt.com)

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

* Deploy automático via GitHub
* Build contínua através de CI/CD
* Banco de dados MySQL integrado
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

Criar arquivo `.env`:

```env
DATABASE_URL="mysql://root:senha@localhost:3306/api_banco"

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=senha
DATABASE_NAME=api_banco

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

Popular banco:

```bash
npx prisma db seed
```

Executar servidor:

```bash
npm run dev
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
* Persistência em banco de dados MySQL
* API RESTful
* Interface Web Responsiva

---

# 🔄 Integração Contínua (CI/CD)

O projeto possui pipeline automatizada utilizando GitHub Actions.

As verificações incluem:

* Instalação de dependências
* Build do frontend
* Build do backend
* Verificação de tipos TypeScript
* Execução de testes (quando configurados)

---

# 🔒 Segurança

* Arquivos `.env` protegidos via `.gitignore`
* Variáveis sensíveis armazenadas em ambiente
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
