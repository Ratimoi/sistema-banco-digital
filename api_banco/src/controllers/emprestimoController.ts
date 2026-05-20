import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const criarEmprestimo = async (req: Request, res: Response) => {
    try {
        const emprestimo = await prisma.emprestimo.create({
            data: req.body
        })
        return res.status(201).json(emprestimo)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao criar empréstimo" })
    }
}

export const listarEmprestimos = async (req: Request, res: Response) => {
    try {
        const emprestimos = await prisma.emprestimo.findMany({
            include: { cliente: true }
        })
        return res.json(emprestimos)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar empréstimos" })
    }
}

export const buscarEmprestimo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const emprestimo = await prisma.emprestimo.findUnique({
            where: { id: Number(id) },
            include: { cliente: true }
        })
        if (!emprestimo) return res.status(404).json({ error: "Empréstimo não encontrado" })
        return res.json(emprestimo)
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar empréstimo" })
    }
}

export const atualizarEmprestimo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const emprestimo = await prisma.emprestimo.update({
            where: { id: Number(id) },
            data: req.body
        })
        return res.json(emprestimo)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao atualizar empréstimo" })
    }
}

export const deletarEmprestimo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await prisma.emprestimo.delete({
            where: { id: Number(id) }
        })
        return res.json({ message: "Empréstimo deletado com sucesso" })
    } catch (error) {
        return res.status(400).json({ error: "Erro ao deletar empréstimo" })
    }
}
