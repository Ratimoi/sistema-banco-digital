import net from "net"
import nodemailer from "nodemailer"
import { prisma } from "../lib/prisma"
import { env } from "../config/env"
import { AppError } from "../utils/AppError"

// O Render não tem rota de saída IPv6 para o SMTP do Gmail, mas o nodemailer sorteia
// aleatoriamente entre os endereços IPv4 e IPv6 resolvidos, causando ENETUNREACH em parte
// das tentativas. Conectamos nós mesmos via IPv4 e entregamos o socket já aberto ao
// nodemailer, que só faz o upgrade para TLS por cima dele.
const conectarSmtpIPv4 = (host: string, port: number, timeoutMs = 10000) =>
  new Promise<net.Socket>((resolve, reject) => {
    const socket = net.createConnection({ host, port, family: 4 })
    const timer = setTimeout(() => {
      socket.destroy()
      reject(new Error(`Timeout ao conectar em ${host}:${port} via IPv4`))
    }, timeoutMs)
    socket.once("connect", () => {
      clearTimeout(timer)
      resolve(socket)
    })
    socket.once("error", (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })

const criarTransporter = async () => {
  const socket = await conectarSmtpIPv4("smtp.gmail.com", 465)
  return nodemailer.createTransport({
    connection: socket,
    // O socket já vem conectado, então o nodemailer não sabe o hostname pra validar o
    // certificado TLS — sem isso ele valida contra "localhost" e o handshake falha.
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  })
}

export const enviarEmailRecuperacaoSenha = async (email: string, nome: string, codigo: string) => {
  const transporter = await criarTransporter()

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

  const transporter = await criarTransporter()

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
