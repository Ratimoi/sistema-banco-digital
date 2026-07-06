import { Resend } from "resend"
import { prisma } from "../lib/prisma"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"

// SMTP direto (porta 465/587) é bloqueado para saída no plano free do Render — envia por
// HTTPS via Resend em vez disso, que é a mesma porta (443) já usada pelo resto da API.
// Inicializado sob demanda: o construtor do Resend lança exceção sem API key, e não devemos
// derrubar o app inteiro se e-mail não estiver configurado (mesma tolerância de antes).
const getResend = () => new Resend(env.RESEND_API_KEY)
const REMETENTE = env.EMAIL_FROM ?? "TeenBank <onboarding@resend.dev>"

export const enviarEmailRecuperacaoSenha = async (email: string, nome: string, codigo: string) => {
  const { error } = await getResend().emails.send({
    from: REMETENTE,
    to: email,
    subject: "🔐 Recuperação de senha",
    text: `
Olá ${nome},

Recebemos uma solicitação de recuperação de senha para sua conta.

Seu código de recuperação é: ${codigo}

Este código expira em 15 minutos. Se você não solicitou essa recuperação, ignore este e-mail.
    `,
  })

  if (error) throw new AppError(`Falha ao enviar e-mail: ${error.message}`, 502)
}

export const enviarEmailRelatorio = async (clienteId: number) => {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      conta: {
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

  const transacoes = cliente.conta
    ? [...cliente.conta.transacoesEnviadas, ...cliente.conta.transacoesRecebidas]
    : []

  const relatorio =
    transacoes.length > 0
      ? transacoes
          .map((t) => `${t.tipo} | R$ ${t.valor.toFixed(2)} | ${t.createdAt.toLocaleString()}`)
          .join("\n")
      : "Nenhuma transação encontrada."

  const { error } = await getResend().emails.send({
    from: REMETENTE,
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

  if (error) throw new AppError(`Falha ao enviar e-mail: ${error.message}`, 502)

  return true
}
