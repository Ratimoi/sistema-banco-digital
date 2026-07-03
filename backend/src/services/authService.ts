import bcrypt from "bcryptjs"
import jwt, { SignOptions } from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"
import { LoginInput, EsqueciSenhaInput, RedefinirSenhaInput } from "../schemas/authSchema"
import { registrarLog } from "./logService"
import { enviarEmailRecuperacaoSenha } from "./emailService"

const SALT_ROUNDS = 10
const MAX_TENTATIVAS = 3
const BLOQUEIO_MINUTOS = 15
const RECUPERACAO_MINUTOS = 15

export const hashPassword = (senha: string) => bcrypt.hash(senha, SALT_ROUNDS)

export const login = async ({ email, senha }: LoginInput) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) throw new AppError("E-mail ou senha inválidos", 401)

  if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    await registrarLog(usuario.id, "LOGIN_BLOQUEADO", `Tentativa de login enquanto bloqueado: ${email}`)
    throw new AppError(
      "Usuário bloqueado por excesso de tentativas inválidas. Tente novamente mais tarde.",
      423,
    )
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha)

  if (!senhaValida) {
    const tentativas = usuario.tentativasFalhas + 1
    const bloquear = tentativas >= MAX_TENTATIVAS

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tentativasFalhas: bloquear ? 0 : tentativas,
        bloqueadoAte: bloquear ? new Date(Date.now() + BLOQUEIO_MINUTOS * 60 * 1000) : null,
      },
    })

    await registrarLog(
      usuario.id,
      bloquear ? "LOGIN_FALHA_BLOQUEIO" : "LOGIN_FALHA",
      `Tentativa ${tentativas} de ${MAX_TENTATIVAS} para ${email}`,
    )

    if (bloquear) {
      throw new AppError(
        `Usuário bloqueado por ${BLOQUEIO_MINUTOS} minutos após ${MAX_TENTATIVAS} tentativas inválidas.`,
        423,
      )
    }

    throw new AppError("E-mail ou senha inválidos", 401)
  }

  const ultimoLoginAnterior = usuario.ultimoLogin

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { tentativasFalhas: 0, bloqueadoAte: null, ultimoLogin: new Date() },
  })

  await registrarLog(usuario.id, "LOGIN_SUCESSO", `Login de ${email}`)

  const token = jwt.sign({ sub: usuario.id, nivel: usuario.nivel }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  })

  const mensagem = ultimoLoginAnterior
    ? `Bem-vindo, ${usuario.nome}. Seu último acesso ao sistema foi em ${ultimoLoginAnterior.toLocaleString("pt-BR")}.`
    : `Bem-vindo, ${usuario.nome}. Este é o seu primeiro acesso ao sistema.`

  return {
    token,
    mensagem,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel },
  }
}

const gerarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString()

export const solicitarRecuperacaoSenha = async ({ email }: EsqueciSenhaInput) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } })

  // Não revela se o e-mail existe ou não, mas só envia/loga quando existe.
  if (usuario) {
    const codigo = gerarCodigo()
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: codigo,
        resetTokenExpiry: new Date(Date.now() + RECUPERACAO_MINUTOS * 60 * 1000),
      },
    })

    await enviarEmailRecuperacaoSenha(usuario.email, usuario.nome, codigo)
    await registrarLog(usuario.id, "RECUPERACAO_SOLICITADA", `Código de recuperação enviado para ${email}`)
  }

  return { message: "Se o e-mail estiver cadastrado, um código de recuperação foi enviado." }
}

export const redefinirSenha = async ({ email, codigo, novaSenha }: RedefinirSenhaInput) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } })

  if (
    !usuario ||
    !usuario.resetToken ||
    usuario.resetToken !== codigo ||
    !usuario.resetTokenExpiry ||
    usuario.resetTokenExpiry < new Date()
  ) {
    throw new AppError("Código de recuperação inválido ou expirado", 400)
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senha: await hashPassword(novaSenha),
      resetToken: null,
      resetTokenExpiry: null,
      tentativasFalhas: 0,
      bloqueadoAte: null,
    },
  })

  await registrarLog(usuario.id, "SENHA_REDEFINIDA", `Senha redefinida via recuperação para ${email}`)

  return { message: "Senha redefinida com sucesso" }
}
