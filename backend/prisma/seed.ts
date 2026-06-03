import "dotenv/config"
import { PrismaClient } from "../generated/prisma"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

function getDbConfig() {
  const url = process.env.DATABASE_URL
  if (url) {
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/)
    if (!match) throw new Error("DATABASE_URL inválida")
    const [, user, password, host, port, database] = match
    return { host, user, password, database, port: port ? parseInt(port) : 3306 }
  }
  return {
    host:     process.env.DATABASE_HOST     ?? "localhost",
    user:     process.env.DATABASE_USER     ?? "root",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME     ?? "api_banco",
    port:     parseInt(process.env.DATABASE_PORT ?? "3306"),
  }
}

const adapter = new PrismaMariaDb({ ...getDbConfig(), connectionLimit: 5 })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Evita duplicar dados se o seed já foi executado
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
