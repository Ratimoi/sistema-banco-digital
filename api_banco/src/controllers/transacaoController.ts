import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const listarTransacoes = async (req: Request, res: Response) => {
    try {
        const transacoes = await prisma.transacao.findMany({
            include: {
                contaOrigem: true,
                contaDestino: true
            }
        })
        return res.json(transacoes)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar transações" })
    }
}

export const buscarTransacao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const transacao = await prisma.transacao.findUnique({
            where: { id: Number(id) },
            include: {
                contaOrigem: true,
                contaDestino: true
            }
        })
        if (!transacao) return res.status(404).json({ error: "Transação não encontrada" })
        return res.json(transacao)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar transação" })
    }
}

export const deposito = async (req: Request, res: Response) => {
    try {
        const { contaId, valor } = req.body

        await prisma.$transaction(async (tx) => {
            const conta = await tx.conta.findUnique({ where: { id: contaId } })
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
        })

        return res.json({ message: "Depósito realizado com sucesso" })
    } catch (error: any) {
        return res.status(400).json({ error: error.message || "Erro ao realizar depósito" })
    }
}

export const saque = async (req: Request, res: Response) => {
    try {
        const { contaId, valor } = req.body

        await prisma.$transaction(async (tx) => {
            const conta = await tx.conta.findUnique({ where: { id: contaId } })
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
        })

        return res.json({ message: "Saque realizado com sucesso" })
    } catch (error: any) {
        return res.status(400).json({ error: error.message || "Erro ao realizar saque" })
    }
}

export const transferencia = async (req: Request, res: Response) => {
    try {
        const { origemId, destinoId, valor } = req.body

        await prisma.$transaction(async (tx) => {
            const origem = await tx.conta.findUnique({ where: { id: origemId } })
            const destino = await tx.conta.findUnique({ where: { id: destinoId } })

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
        })

        return res.json({ message: "Transferência realizada com sucesso" })
    } catch (error: any) {
        return res.status(400).json({ error: error.message || "Erro ao realizar transferência" })
    }
}
