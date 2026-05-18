import { prisma } from "../../lib/prisma"

// CREATE
export const criarCliente = async (req: any, res: any) => {
    try {
        const cliente = await prisma.cliente.create({
            data: req.body
        })

        return res.json(cliente)
    } catch (error) {
        return res.status(400).json({ error: "Erro ao criar cliente" })
    }
}

// READ
export const listarClientes = async (req: any, res: any) => {
    const clientes = await prisma.cliente.findMany({
        include: { contas: true }
    })

    return res.json(clientes)
}

// DELETE
export const deletarCliente = async (req: any, res: any) => {
    const { id } = req.params

    await prisma.cliente.delete({
        where: { id: Number(id) }
    })

    return res.json({ message: "Cliente deletado" })
}