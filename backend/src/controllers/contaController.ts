import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const criarConta = async (req: Request, res: Response) => {
    try {
        const conta = await prisma.conta.create({
            data: req.body
        })
        return res.status(201).json(conta)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao criar conta" })
    }
}

export const listarContas = async (req: Request, res: Response) => {
    try {
        const contas = await prisma.conta.findMany({
            include: { cliente: true }
        })
        return res.json(contas)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar contas" })
    }
}

export const buscarConta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const conta = await prisma.conta.findUnique({
            where: { id: Number(id) },
            include: {
                cliente: true,
                cartoes: true,
                transacoesEnviadas: true,
                transacoesRecebidas: true
            }
        })
        if (!conta) return res.status(404).json({ error: "Conta não encontrada" })
        return res.json(conta)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar conta" })
    }
}

export const contasPorCliente = async (req: Request, res: Response) => {
    try {
        const { clienteId } = req.params
        const contas = await prisma.conta.findMany({
            where: { clienteId: Number(clienteId) },
            include: {
                transacoesEnviadas: true,
                transacoesRecebidas: true
            }
        })
        return res.json(contas)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar contas do cliente" })
    }
}

export const atualizarConta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const conta = await prisma.conta.update({
            where: { id: Number(id) },
            data: req.body
        })
        return res.json(conta)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao atualizar conta" })
    }
}

export const deletarConta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await prisma.conta.delete({
            where: { id: Number(id) }
        })
        return res.json({ message: "Conta deletada com sucesso" })
    } catch (error) {
        return res.status(400).json({ error: "Erro ao deletar conta" })
    }
}
