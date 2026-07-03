import bcrypt from "bcryptjs"
import jwt, { SignOptions } from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"
import { LoginInput } from "../schemas/authSchema"

const SALT_ROUNDS = 10

export const hashPassword = (senha: string) => bcrypt.hash(senha, SALT_ROUNDS)

export const login = async ({ email, senha }: LoginInput) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) throw new AppError("E-mail ou senha inválidos", 401)

  const senhaValida = await bcrypt.compare(senha, usuario.senha)
  if (!senhaValida) throw new AppError("E-mail ou senha inválidos", 401)

  const token = jwt.sign({ sub: usuario.id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  })

  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  }
}
