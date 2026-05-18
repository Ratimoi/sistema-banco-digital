import nodemailer from "nodemailer"
import { prisma } from "../../lib/prisma"

export const enviarEmailRelatorio = async (clienteId: number) => {

    const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        include: {
            contas: {
                include: {
                    transacoesEnviadas: true,
                    transacoesRecebidas: true
                }
            }
        }
    })

    if (!cliente) {
        throw new Error("Cliente não encontrado")
    }

    // Junta todas as transações
    const transacoes = cliente.contas.flatMap(conta => [
        ...conta.transacoesEnviadas,
        ...conta.transacoesRecebidas
    ])

    // Formata o conteúdo do e-mail
    const relatorio = transacoes.length > 0
        ? transacoes.map(t =>
            `${t.tipo} | R$ ${t.valor} | ${t.createdAt.toLocaleString()}`
        ).join("\n")
        : "Nenhuma transação encontrada."

    // Configuração do transporte de e-mail
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

    // Envio do e-mail
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
        `
    })

    return true
}