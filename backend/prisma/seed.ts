import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
})

const adapter = new PrismaPg({ pool })
const prisma = new PrismaClient({ adapter })

async function main() {
  const count = await prisma.cliente.count()
  if (count > 0) {
    console.log("⏭️  Seed ignorado: banco já possui dados.")
    return
  }

  const cliente1 = await prisma.cliente.create({
    data: { nome: "João Silva", cpf: "12345678900", email: "joao@email.com", senha: "123456" }
  })

  const cliente2 = await prisma.cliente.create({
    data: { nome: "Maria Oliveira", cpf: "98765432100", email: "maria@email.com", senha: "123456" }
  })

  const conta1 = await prisma.conta.create({
    data: { numeroConta: "1001", saldo: 1000, tipo: "corrente", clienteId: cliente1.id }
  })

  const conta2 = await prisma.conta.create({
    data: { numeroConta: "1002", saldo: 500, tipo: "corrente", clienteId: cliente2.id }
  })

  await prisma.cartao.create({
    data: { numero: "1111-2222-3333-4444", validade: "12/30", cvv: "123", tipo: "credito", contaId: conta1.id }
  })

  await prisma.emprestimo.create({
    data: { valor: 5000, taxaJuros: 2.5, parcelas: 12, status: "ativo", clienteId: cliente1.id }
  })

  await prisma.transacao.create({
    data: { tipo: "DEPOSITO", valor: 200, descricao: "Depósito inicial", contaDestinoId: conta1.id }
  })

  await prisma.transacao.create({
    data: { tipo: "TRANSFERENCIA", valor: 100, descricao: "Transferência teste", contaOrigemId: conta1.id, contaDestinoId: conta2.id }
  })

  console.log("🌱 Seed executado com sucesso!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
