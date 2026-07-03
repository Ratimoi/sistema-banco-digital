import nodemailer from "nodemailer"
import { prisma } from "../lib/prisma"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"

const criarTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  })

export const enviarEmailRecuperacaoSenha = async (email: string, nome: string, codigo: string) => {
  const transporter = criarTransporter()

  await transporter.sendMail({
    from: "Banco API <no-reply@banco.com>",
    to: email,
    subject: "🔐 Recuperação de senha",
    text: `
Olá ${nome},

Recebemos uma solicitação de recuperação de senha para sua conta.

Seu código de recuperação é: ${codigo}

Este código expira em 15 minutos. Se você não solicitou essa recuperação, ignore este e-mail.
    `,
  })
}

export const enviarEmailRelatorio = async (clienteId: number) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      contas: {
        include: {
          transacoesEnviadas: true,
          transacoesRecebidas: true,
        },
      },
    },
  })

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404)
  }

  const transacoes = cliente.contas.flatMap((conta) => [
    ...conta.transacoesEnviadas,
    ...conta.transacoesRecebidas,
  ])

  const relatorio =
    transacoes.length > 0
      ? transacoes
          .map((t) => `${t.tipo} | R$ ${t.valor.toFixed(2)} | ${t.createdAt.toLocaleString()}`)
          .join("\n")
      : "Nenhuma transação encontrada."

  const transporter = criarTransporter()

  await transporter.sendMail({
    from: "Banco API <no-reply@banco.com>",
    to: cliente.email,
    subject: "📄 Relatório de Transações Bancárias",
    text: `
Olá ${cliente.nome},

Segue seu relatório de transações:

--------------------------------
${relatorio}
--------------------------------

Obrigado por usar nosso sistema bancário!
    `,
  })

  return true
}
