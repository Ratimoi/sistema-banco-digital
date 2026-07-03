import { prisma } from "../lib/prisma"
import { AppError } from "../utils/AppError"
import { hashPassword } from "./authService"
import { registrarLog } from "./logService"
import { CreateUsuarioInput } from "../schemas/usuarioSchema"

const usuarioSelect = {
  id: true,
  nome: true,
  email: true,
  nivel: true,
  ultimoLogin: true,
  createdAt: true,
}

export const criar = async (data: CreateUsuarioInput) => {
  const existente = await prisma.usuario.findUnique({ where: { email: data.email } })
  if (existente) {
    throw new AppError("Já existe um usuário cadastrado com esse e-mail", 409)
  }

  const usuario = await prisma.usuario.create({
    data: { ...data, senha: await hashPassword(data.senha) },
    select: usuarioSelect,
  })

  await registrarLog(usuario.id, "USUARIO_CRIADO", `Usuário ${usuario.email} criado`)

  return usuario
}

export const listar = () => {
  return prisma.usuario.findMany({
    select: usuarioSelect,
    orderBy: { id: "asc" },
  })
}
