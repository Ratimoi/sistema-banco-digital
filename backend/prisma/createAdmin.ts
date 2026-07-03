import { prisma } from "../src/lib/prisma"
import { hashPassword } from "../src/services/authService"
import { senhaForteSchema } from "../src/schemas/usuarioSchema"

async function main() {
  const nome = process.env.ADMIN_NOME ?? "Administrador"
  const email = process.env.ADMIN_EMAIL
  const senha = process.env.ADMIN_SENHA
  const nivel = Number(process.env.ADMIN_NIVEL ?? 3)

  if (!email || !senha) {
    console.error("Defina ADMIN_EMAIL e ADMIN_SENHA antes de rodar este script.")
    process.exit(1)
  }

  const senhaValida = senhaForteSchema.safeParse(senha)
  if (!senhaValida.success) {
    console.error("ADMIN_SENHA inválida:")
    senhaValida.error.issues.forEach((issue) => console.error(`- ${issue.message}`))
    process.exit(1)
  }

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    console.error(`Já existe um usuário com o e-mail ${email}.`)
    process.exit(1)
  }

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: await hashPassword(senha), nivel },
    select: { id: true, nome: true, email: true, nivel: true, createdAt: true },
  })

  console.log(`Usuário administrador criado: ${usuario.email} (id ${usuario.id}, nível ${usuario.nivel})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
