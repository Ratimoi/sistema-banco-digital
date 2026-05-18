import { prisma } from "../../lib/prisma"

export const criarEmprestimo = async (req: any, res: any) => {
    const emprestimo = await prisma.emprestimo.create({
        data: req.body
    })

    return res.json(emprestimo)
}

export const listarEmprestimos = async (req: any, res: any) => {
    const emprestimos = await prisma.emprestimo.findMany({
        include: { cliente: true }
    })

    return res.json(emprestimos)
}