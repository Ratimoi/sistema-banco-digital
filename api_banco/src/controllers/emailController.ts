import { enviarEmailRelatorio } from "../services/emailService";

export const enviarEmailCliente = async (req: any, res: any) => {
    const { id } = req.params;

    try {
        await enviarEmailRelatorio(Number(id));

        return res.json({
            message: "E-mail enviado com sucesso!"
        });

    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        });
    }
};