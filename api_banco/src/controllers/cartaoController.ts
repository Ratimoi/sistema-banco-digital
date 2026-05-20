import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const criarCartao = async (req: Request, res: Response) => {
    try {
        const cartao = await prisma.cartao.create({
            data: req.body
        })
        return res.status(201).json(cartao)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao criar cartão" })
    }
}

export const listarCartoes = async (req: Request, res: Response) => {
    try {
        const cartoes = await prisma.cartao.findMany({
            include: { conta: true }
        })
        return res.json(cartoes)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar cartões" })
    }
}

export const buscarCartao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const cartao = await prisma.cartao.findUnique({
            where: { id: Number(id) },
            include: { conta: true }
        })
        if (!cartao) return res.status(404).json({ error: "Cartão não encontrado" })
        return res.json(cartao)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar cartão" })
    }
}

export const atualizarCartao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const cartao = await prisma.cartao.update({
            where: { id: Number(id) },
            data: req.body
        })
        return res.json(cartao)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao atualizar cartão" })
    }
}

export const deletarCartao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await prisma.cartao.delete({
            where: { id: Number(id) }
        })
        return res.json({ message: "Cartão deletado com sucesso" })
    } catch (error) {
        return res.status(400).json({ error: "Erro ao deletar cartão" })
    }
}
