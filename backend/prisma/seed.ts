import bcrypt from "bcryptjs"
import { prisma } from "../src/lib/prisma"

const ADMIN_EMAIL = "admin@banco.com"
const ADMIN_SENHA = "admin123"

async function main() {
  const usuarioCount = await prisma.usuario.count()
  if (usuarioCount === 0) {
    await prisma.usuario.create({
      data: {
        nome: "Administrador",
        email: ADMIN_EMAIL,
        senha: await bcrypt.hash(ADMIN_SENHA, 10),
      },
    })
    console.log(`👤 Usuário admin criado: ${ADMIN_EMAIL} / ${ADMIN_SENHA} (troque em produção)`)
  }

  const clienteCount = await prisma.cliente.count()
  if (clienteCount > 0) {
    console.log("⏭️  Seed de dados ignorado: banco já possui clientes.")
    return
  }

  const senhaClientePadrao = await bcrypt.hash("123456", 10)

  const cliente1 = await prisma.cliente.create({
    data: { nome: "João Silva", cpf: "12345678900", email: "joao@email.com", senha: senhaClientePadrao },
  })

  const cliente2 = await prisma.cliente.create({
    data: { nome: "Maria Oliveira", cpf: "98765432100", email: "maria@email.com", senha: senhaClientePadrao },
  })

  const conta1 = await prisma.conta.create({
    data: { numeroConta: "1001", saldo: 1000, tipo: "corrente", clienteId: cliente1.id },
  })

  const conta2 = await prisma.conta.create({
    data: { numeroConta: "1002", saldo: 500, tipo: "corrente", clienteId: cliente2.id },
  })

  await prisma.cartao.create({
    data: {
      numero: "1111-2222-3333-4444",
      validade: "12/30",
      cvv: "123",
      tipo: "credito",
      limite: 5000,
      contaId: conta1.id,
    },
  })

  await prisma.emprestimo.create({
    data: { valor: 5000, taxaJuros: 2.5, parcelas: 12, status: "ativo", clienteId: cliente1.id },
  })

  await prisma.transacao.create({
    data: { tipo: "DEPOSITO", valor: 200, descricao: "Depósito inicial", contaDestinoId: conta1.id },
  })

  await prisma.transacao.create({
    data: {
      tipo: "TRANSFERENCIA",
      valor: 100,
      descricao: "Transferência teste",
      contaOrigemId: conta1.id,
      contaDestinoId: conta2.id,
    },
  })

  console.log("🌱 Seed executado com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
