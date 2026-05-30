# 🏦 Sistema Bancário — API + Frontend

Sistema de gerenciamento bancário com API REST em Node.js/Express + interface web em React.

---

## 📁 Estrutura do Projeto

```
sistema_banco/
├── backend/        → API REST
└── frontend/         → Interface web (React)
```

---

## 🗄️ Banco de Dados — Diagrama E-R

```
Cliente (1) ──────── (N) Conta
   │                       │
   └── (N) Emprestimo      ├── (N) Cartao
                           └── (N) Transacao (origem/destino)
```

### Models

| Model | Campos principais |
|---|---|
| **Cliente** | id, nome, cpf, email, senha, createdAt |
| **Conta** | id, numeroConta, saldo, tipo, clienteId |
| **Cartao** | id, numero, validade, cvv, tipo, contaId |
| **Emprestimo** | id, valor, taxaJuros, parcelas, status, clienteId |
| **Transacao** | id, tipo, valor, descricao, contaOrigemId, contaDestinoId, createdAt |

---

## ⚙️ Tecnologias

**Backend**
- Node.js + TypeScript
- Express 5
- Prisma 7 (ORM)
- MySQL / MariaDB
- Nodemailer (envio de e-mail)

**Frontend**
- React 18 + TypeScript
- Vite
- React Router DOM
- Axios

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- MySQL rodando localmente

### 1. Configurar o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL="mysql://root:sua_senha@localhost:3306/api_banco"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD="sua_senha"
DATABASE_NAME="api_banco"

EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password_gmail
```

Gere o client do Prisma e crie as tabelas:

```bash
npx prisma generate
npx prisma migrate dev
```

Popule o banco com dados iniciais (opcional):

```bash
npx prisma db seed
```

Inicie a API:

```bash
npm run dev
```

API disponível em `http://localhost:3000`

---

### 2. Configurar o Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface disponível em `http://localhost:5173`

> O Vite está configurado para redirecionar chamadas `/api` automaticamente para `http://localhost:3000`, então basta ter a API rodando ao mesmo tempo.

---

## 📌 Rotas da API

Base URL: `http://localhost:3000/api`

### 👤 Clientes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/clientes` | Listar todos |
| GET | `/clientes/:id` | Buscar por ID |
| POST | `/clientes` | Criar |
| PUT | `/clientes/:id` | Atualizar |
| DELETE | `/clientes/:id` | Deletar |
| GET | `/clientes/:id/email` | Enviar relatório por e-mail |

**POST /clientes — Body:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "email": "joao@email.com",
  "senha": "123456"
}
```

---

### 🏦 Contas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/contas` | Listar todas |
| GET | `/contas/:id` | Buscar por ID |
| GET | `/contas/cliente/:clienteId` | Listar por cliente |
| POST | `/contas` | Criar |
| PUT | `/contas/:id` | Atualizar |
| DELETE | `/contas/:id` | Deletar |

**POST /contas — Body:**
```json
{
  "numeroConta": "2001",
  "tipo": "corrente",
  "saldo": 0,
  "clienteId": 1
}
```

---

### 💸 Transações

| Método | Rota | Descrição |
|---|---|---|
| GET | `/transacoes` | Listar todas |
| GET | `/transacoes/:id` | Buscar por ID |
| POST | `/transacoes/deposito` | Realizar depósito |
| POST | `/transacoes/saque` | Realizar saque |
| POST | `/transacoes/transferencia` | Realizar transferência |

**POST /transacoes/deposito — Body:**
```json
{ "contaId": 1, "valor": 500 }
```

**POST /transacoes/saque — Body:**
```json
{ "contaId": 1, "valor": 100 }
```

**POST /transacoes/transferencia — Body:**
```json
{ "origemId": 1, "destinoId": 2, "valor": 200 }
```

---

### 💰 Empréstimos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/emprestimos` | Listar todos |
| GET | `/emprestimos/:id` | Buscar por ID |
| POST | `/emprestimos` | Criar |
| PUT | `/emprestimos/:id` | Atualizar |
| DELETE | `/emprestimos/:id` | Deletar |

**POST /emprestimos — Body:**
```json
{
  "valor": 3000,
  "taxaJuros": 2.5,
  "parcelas": 12,
  "status": "ativo",
  "clienteId": 1
}
```

---

### 💳 Cartões

| Método | Rota | Descrição |
|---|---|---|
| GET | `/cartoes` | Listar todos |
| GET | `/cartoes/:id` | Buscar por ID |
| POST | `/cartoes` | Criar |
| PUT | `/cartoes/:id` | Atualizar |
| DELETE | `/cartoes/:id` | Deletar |

**POST /cartoes — Body:**
```json
{
  "numero": "5555-6666-7777-8888",
  "validade": "12/30",
  "cvv": "456",
  "tipo": "debito",
  "contaId": 1
}
```

---

## 📧 E-mail

O sistema envia um relatório de transações para o cliente via Gmail.

Para configurar, gere uma **App Password** no Google:
1. Acesse myaccount.google.com
2. Segurança → Verificação em duas etapas → Senhas de app
3. Gere uma senha e coloque em `EMAIL_PASS` no `.env`

---

## 🔒 Segurança

- O arquivo `.env` **não deve ser commitado** — ele já está no `.gitignore`
- Use sempre o `.env.example` como referência para configurar o ambiente

---

## 👨‍💻 Autor

Desenvolvido por **Ramiro Quevedo Paz**  
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)

**Disciplina:** Desenvolvimento de Serviços e APIs  
**Professor:** Edécio Fernando Iepsen
