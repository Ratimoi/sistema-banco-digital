import nodemailer from "nodemailer"
import { prisma } from "../lib/prisma"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"

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

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  })

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
