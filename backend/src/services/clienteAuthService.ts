import bcrypt from "bcryptjs"
import jwt, { SignOptions } from "jsonwebtoken"
import { Prisma } from "../../generated/prisma"
import { prisma } from "../lib/prisma"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"
import { hashPassword } from "../utils/hash"
import { registrarLog } from "./logService"
import { enviarEmailRecuperacaoSenha } from "./emailService"
import {
  CadastroClienteInput,
  LoginClienteInput,
  EsqueciSenhaClienteInput,
  RedefinirSenhaClienteInput,
} from "../schemas/clienteAuthSchema"

type ClienteToken = { id: number; nivel: number }

const gerarAccessToken = ({ id, nivel }: ClienteToken) =>
  jwt.sign({ sub: id, nivel, tipo: "acesso" }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  })

const gerarRefreshToken = ({ id, nivel }: ClienteToken) =>
  jwt.sign({ sub: id, nivel, tipo: "refresh" }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  })

const MAX_TENTATIVAS = 3
const BLOQUEIO_MINUTOS = 15
const RECUPERACAO_MINUTOS = 15

const gerarNumeroConta = () => Math.floor(100000 + Math.random() * 900000).toString()

const gerarNumeroContaUnico = async (tx: Prisma.TransactionClient) => {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const numeroConta = gerarNumeroConta()
    const existente = await tx.conta.findUnique({ where: { numeroConta } })
    if (!existente) return numeroConta
  }
  throw new AppError("Não foi possível gerar um número de conta. Tente novamente.", 500)
}

export const cadastro = async ({ nome, cpf, email, senha, tipoConta }: CadastroClienteInput) => {
  const senhaHash = await hashPassword(senha)

  return prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.create({
      data: { nome, cpf, email, senha: senhaHash },
      select: { id: true, nome: true, cpf: true, email: true, createdAt: true },
    })

    const numeroConta = await gerarNumeroContaUnico(tx)
    const conta = await tx.conta.create({
      data: { numeroConta, tipo: tipoConta, saldo: 0, clienteId: cliente.id },
    })

    return { cliente, conta }
  })
}

export const login = async ({ email, senha }: LoginClienteInput) => {
  const cliente = await prisma.cliente.findUnique({ where: { email } })
  if (!cliente) throw new AppError("E-mail ou senha inválidos", 401)

  if (cliente.bloqueadoAte && cliente.bloqueadoAte > new Date()) {
    await registrarLog(cliente.id, "LOGIN_BLOQUEADO", `Tentativa de login enquanto bloqueado: ${email}`)
    throw new AppError(
      "Usuário bloqueado por excesso de tentativas inválidas. Tente novamente mais tarde.",
      423,
    )
  }

  const senhaValida = await bcrypt.compare(senha, cliente.senha)

  if (!senhaValida) {
    const tentativas = cliente.tentativasFalhas + 1
    const bloquear = tentativas >= MAX_TENTATIVAS

    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        tentativasFalhas: bloquear ? 0 : tentativas,
        bloqueadoAte: bloquear ? new Date(Date.now() + BLOQUEIO_MINUTOS * 60 * 1000) : null,
      },
    })

    await registrarLog(
      cliente.id,
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

  const ultimoLoginAnterior = cliente.ultimoLogin

  await prisma.cliente.update({
    where: { id: cliente.id },
    data: { tentativasFalhas: 0, bloqueadoAte: null, ultimoLogin: new Date() },
  })

  await registrarLog(cliente.id, "LOGIN_SUCESSO", `Login de ${email}`)

  const token = gerarAccessToken(cliente)
  const refreshToken = gerarRefreshToken(cliente)

  const mensagem = ultimoLoginAnterior
    ? `Bem-vindo, ${cliente.nome}. Seu último acesso ao sistema foi em ${ultimoLoginAnterior.toLocaleString("pt-BR")}.`
    : `Bem-vindo, ${cliente.nome}. Este é o seu primeiro acesso ao sistema.`

  return {
    token,
    refreshToken,
    mensagem,
    cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email, nivel: cliente.nivel },
  }
}

export const refresh = async (refreshToken: string) => {
  let payload: jwt.JwtPayload & { tipo?: string }
  try {
    payload = jwt.verify(refreshToken, env.JWT_SECRET) as jwt.JwtPayload & { tipo?: string }
  } catch {
    throw new AppError("Refresh token inválido ou expirado", 401)
  }

  if (payload.tipo !== "refresh") {
    throw new AppError("Refresh token inválido ou expirado", 401)
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: Number(payload.sub) } })
  if (!cliente) throw new AppError("Refresh token inválido ou expirado", 401)

  return { token: gerarAccessToken(cliente) }
}

const gerarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString()

export const solicitarRecuperacaoSenha = async ({ email }: EsqueciSenhaClienteInput) => {
  const cliente = await prisma.cliente.findUnique({ where: { email } })

  if (cliente) {
    const codigo = gerarCodigo()
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        resetToken: codigo,
        resetTokenExpiry: new Date(Date.now() + RECUPERACAO_MINUTOS * 60 * 1000),
      },
    })

    await enviarEmailRecuperacaoSenha(cliente.email, cliente.nome, codigo)
    await registrarLog(cliente.id, "RECUPERACAO_SOLICITADA", `Código de recuperação enviado para ${email}`)
  }

  return { message: "Se o e-mail estiver cadastrado, um código de recuperação foi enviado." }
}

export const redefinirSenha = async ({ email, codigo, novaSenha }: RedefinirSenhaClienteInput) => {
  const cliente = await prisma.cliente.findUnique({ where: { email } })

  if (
    !cliente ||
    !cliente.resetToken ||
    cliente.resetToken !== codigo ||
    !cliente.resetTokenExpiry ||
    cliente.resetTokenExpiry < new Date()
  ) {
    throw new AppError("Código de recuperação inválido ou expirado", 400)
  }

  await prisma.cliente.update({
    where: { id: cliente.id },
    data: {
      senha: await hashPassword(novaSenha),
      resetToken: null,
      resetTokenExpiry: null,
      tentativasFalhas: 0,
      bloqueadoAte: null,
    },
  })

  await registrarLog(cliente.id, "SENHA_REDEFINIDA", `Senha redefinida via recuperação para ${email}`)

  return { message: "Senha redefinida com sucesso" }
}
