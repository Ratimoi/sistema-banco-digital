import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { enviarEmailRelatorio } from "../services/emailService"

export const enviarEmailCliente = asyncHandler(async (req: Request, res: Response) => {
  await enviarEmailRelatorio(Number(req.params.id))
  return res.json({ message: "E-mail enviado com sucesso!" })
})
