import { prisma } from "../src/lib/prisma"
import { hashPassword } from "../src/utils/hash"
import { senhaForteSchema } from "../src/schemas/common"

async function main() {
  const nome = process.env.ADMIN_NOME ?? "Administrador"
  const email = process.env.ADMIN_EMAIL
  const senha = process.env.ADMIN_SENHA
  const cpf = process.env.ADMIN_CPF
  const nivel = Number(process.env.ADMIN_NIVEL ?? 3)

  if (!email || !senha || !cpf) {
    console.error("Defina ADMIN_EMAIL, ADMIN_SENHA e ADMIN_CPF antes de rodar este script.")
    process.exit(1)
  }

  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 3) {
    console.error("ADMIN_NIVEL deve ser um inteiro entre 1 e 3 (nível 0 é cliente comum, não equipe).")
    process.exit(1)
  }

  const senhaValida = senhaForteSchema.safeParse(senha)
  if (!senhaValida.success) {
    console.error("ADMIN_SENHA inválida:")
    senhaValida.error.issues.forEach((issue) => console.error(`- ${issue.message}`))
    process.exit(1)
  }

  const existente = await prisma.cliente.findUnique({ where: { email } })
  if (existente) {
    console.error(`Já existe uma conta com o e-mail ${email}.`)
    process.exit(1)
  }

  const cliente = await prisma.cliente.create({
    data: { nome, cpf, email, senha: await hashPassword(senha), nivel },
    select: { id: true, nome: true, email: true, nivel: true, createdAt: true },
  })

  console.log(`Conta de equipe criada: ${cliente.email} (id ${cliente.id}, nível ${cliente.nivel})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
