import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const criarCliente = async (req: Request, res: Response) => {
    try {
        const cliente = await prisma.cliente.create({
            data: req.body
        })
        return res.status(201).json(cliente)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao criar cliente" })
    }
}

export const listarClientes = async (req: Request, res: Response) => {
    try {
        const clientes = await prisma.cliente.findMany({
            include: { contas: true }
        })
        return res.json(clientes)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar clientes" })
    }
}

export const buscarCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const cliente = await prisma.cliente.findUnique({
            where: { id: Number(id) },
            include: { contas: true, emprestimos: true }
        })
        if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" })
        return res.json(cliente)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar cliente" })
    }
}

export const atualizarCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const cliente = await prisma.cliente.update({
            where: { id: Number(id) },
            data: req.body
        })
        return res.json(cliente)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao atualizar cliente" })
    }
}

export const deletarCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await prisma.cliente.delete({
            where: { id: Number(id) }
        })
        return res.json({ message: "Cliente deletado com sucesso" })
    } catch (error) {
        return res.status(400).json({ error: "Erro ao deletar cliente" })
    }
}
