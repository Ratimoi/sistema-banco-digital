# 🏦 API Banco Digital - Desenvolvimento de Serviços e APIs

## 📚 Curso
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas  
Disciplina: Desenvolvimento de Serviços e APIs  
Professor: Edécio Fernando Iepsen  

---

## 📌 Descrição do Projeto

Este projeto consiste no desenvolvimento de uma API REST simulando um sistema bancário digital.

A aplicação permite o gerenciamento de clientes, contas bancárias, cartões, empréstimos e transações financeiras, incluindo depósitos, saques e transferências entre contas.

O sistema também envia e-mails com relatório de transações do cliente.

---

## ⚙️ Tecnologias Utilizadas

- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL
- Nodemailer

---

## 🧱 Banco de Dados

Entidades principais:

- Cliente
- Conta
- Transação
- Empréstimo
- Cartão

Relacionamentos:
- Cliente → Contas
- Conta → Transações
- Conta → Cartões
- Cliente → Empréstimos

---

## 🚀 Funcionalidades

### 👤 Clientes
- Criar cliente
- Listar clientes
- Remover cliente

### 🏦 Contas
- Criar conta
- Listar contas por cliente

### 💸 Transações
- Depósito
- Saque
- Transferência (com `$transaction`)

### 💳 Empréstimos
- Criar empréstimo
- Listar empréstimos

### 💳 Cartões
- Criar cartão
- Listar cartões

### 📧 E-mail
- Envio de relatório de transações do cliente

---

## 📡 Base URL

http://localhost:3000/api

---

## 📌 Rotas

### Clientes
GET /clientes  
POST /clientes  
DELETE /clientes/:id  

### Contas
POST /contas  
GET /contas/cliente/:clienteId  

### Transações
POST /transacoes/deposito  
POST /transacoes/saque  
POST /transacoes/transferencia  

### Empréstimos
POST /emprestimos  
GET /emprestimos  

### Cartões
POST /cartoes  
GET /cartoes  

### E-mail
GET /clientes/:id/email  

---

## 🔐 Configuração (.env)

DATABASE_URL="mysql://user:password@localhost:3306/banco"  
EMAIL_USER=seuemail@gmail.com  
EMAIL_PASS=sua_senha_de_app  

---

## ▶️ Como executar

npm install  
npx prisma migrate dev  
npm run dev  

---

## 🧪 Testes

Testado com o software Bruno.

---

## 👨‍💻 Autor

Projeto acadêmico da disciplina de Desenvolvimento de Serviços e APIs.