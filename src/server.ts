import express from "express"
import routes from "./routes"

const app = express()
const PORT = 3000

app.use(express.json())

// todas as rotas
app.use("/api", routes)

app.listen(PORT, () => {
    console.log(`API está rodando na porta: ${PORT}`)
})

/*
========================================================
🏦 SISTEMA BANCÁRIO - API DOCUMENTAÇÃO DE ROTAS
========================================================

📌 BASE URL:
http://localhost:3000/api

--------------------------------------------------------
👤 CLIENTES
--------------------------------------------------------
GET    /clientes                  -> Lista todos os clientes
POST   /clientes                  -> Cria um novo cliente
DELETE /clientes/:id             -> Remove um cliente

--------------------------------------------------------
🏦 CONTAS
--------------------------------------------------------
POST   /contas                   -> Cria uma conta bancária
GET    /contas/cliente/:id      -> Lista contas de um cliente específico

--------------------------------------------------------
💸 TRANSAÇÕES (PARTE PRINCIPAL DO TRABALHO)
--------------------------------------------------------
POST   /transacoes/deposito      -> Realiza depósito em conta
POST   /transacoes/saque         -> Realiza saque da conta
POST   /transacoes/transferencia -> Realiza transferência entre contas
                                     (usa transação no banco - $transaction)

--------------------------------------------------------
💳 EMPRÉSTIMOS
--------------------------------------------------------
POST   /emprestimos              -> Cria um empréstimo para cliente
GET    /emprestimos              -> Lista todos os empréstimos

--------------------------------------------------------
💳 CARTÕES
--------------------------------------------------------
POST   /cartoes                  -> Cria cartão vinculado a uma conta
GET    /cartoes                  -> Lista todos os cartões

--------------------------------------------------------
📧 RELATÓRIO (EMAIL)
--------------------------------------------------------
GET    /clientes/:id/email       -> Envia e-mail com histórico de transações
                                     do cliente

--------------------------------------------------------
🚀 OBSERVAÇÕES IMPORTANTES
--------------------------------------------------------
✔ API organizada em controllers, routes e services
✔ Uso de Prisma ORM com MySQL
✔ Uso de transações reais ($transaction) em operações bancárias
✔ Sistema simula operações de banco digital
✔ Estrutura pronta para manutenção e escalabilidade

========================================================
*/