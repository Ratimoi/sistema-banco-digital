import { prisma } from "../../lib/prisma"

export const deposito = async (req: any, res: any) => {
    const { contaId, valor } = req.body

    const result = await prisma.$transaction(async (tx) => {

        const conta = await tx.conta.findUnique({
            where: { id: contaId }
        })

        if (!conta) throw new Error("Conta não encontrada")

        await tx.conta.update({
            where: { id: contaId },
            data: { saldo: conta.saldo + valor }
        })

        await tx.transacao.create({
            data: {
                tipo: "DEPOSITO",
                valor,
                contaDestinoId: contaId,
                descricao: "Depósito em conta"
            }
        })

        return true
    })

    return res.json({ message: "Depósito realizado", result })
}

export const saque = async (req: any, res: any) => {
    const { contaId, valor } = req.body

    const result = await prisma.$transaction(async (tx) => {

        const conta = await tx.conta.findUnique({
            where: { id: contaId }
        })

        if (!conta) throw new Error("Conta não encontrada")
        if (conta.saldo < valor) throw new Error("Saldo insuficiente")

        await tx.conta.update({
            where: { id: contaId },
            data: { saldo: conta.saldo - valor }
        })

        await tx.transacao.create({
            data: {
                tipo: "SAQUE",
                valor,
                contaOrigemId: contaId,
                descricao: "Saque em conta"
            }
        })

        return true
    })

    return res.json({ message: "Saque realizado", result })
}

export const transferencia = async (req: any, res: any) => {
    const { origemId, destinoId, valor } = req.body

    const result = await prisma.$transaction(async (tx) => {

        const origem = await tx.conta.findUnique({
            where: { id: origemId }
        })

        const destino = await tx.conta.findUnique({
            where: { id: destinoId }
        })

        if (!origem || !destino) throw new Error("Conta não encontrada")
        if (origem.saldo < valor) throw new Error("Saldo insuficiente")

        await tx.conta.update({
            where: { id: origemId },
            data: { saldo: origem.saldo - valor }
        })

        await tx.conta.update({
            where: { id: destinoId },
            data: { saldo: destino.saldo + valor }
        })

        await tx.transacao.create({
            data: {
                tipo: "TRANSFERENCIA",
                valor,
                contaOrigemId: origemId,
                contaDestinoId: destinoId,
                descricao: "Transferência entre contas"
            }
        })

        return true
    })

    return res.json({
        message: "Transferência realizada",
        success: result
    })
}