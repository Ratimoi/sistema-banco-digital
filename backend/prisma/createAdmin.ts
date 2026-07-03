import { prisma } from "../src/lib/prisma"
import { hashPassword } from "../src/services/authService"

async function main() {
  const nome = process.env.ADMIN_NOME ?? "Administrador"
  const email = process.env.ADMIN_EMAIL
  const senha = process.env.ADMIN_SENHA

  if (!email || !senha) {
    console.error("Defina ADMIN_EMAIL e ADMIN_SENHA antes de rodar este script.")
    process.exit(1)
  }

  if (senha.length < 6) {
    console.error("ADMIN_SENHA deve ter pelo menos 6 caracteres.")
    process.exit(1)
  }

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    console.error(`Já existe um usuário com o e-mail ${email}.`)
    process.exit(1)
  }

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: await hashPassword(senha) },
    select: { id: true, nome: true, email: true, createdAt: true },
  })

  console.log(`Usuário administrador criado: ${usuario.email} (id ${usuario.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
