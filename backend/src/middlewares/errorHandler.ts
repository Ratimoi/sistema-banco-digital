import { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { MulterError } from "multer"
import { Prisma } from "../../generated/prisma"
import { AppError } from "../utils/AppError"
import { logger } from "../utils/logger"

const PRISMA_ERROR_STATUS: Record<string, number> = {
  P2002: 409, // unique constraint violation
  P2025: 404, // record not found
  P2003: 409, // foreign key constraint violation
}

const PRISMA_ERROR_MESSAGE: Record<string, string> = {
  P2002: "Já existe um registro com esses dados",
  P2025: "Registro não encontrado",
  P2003: "Operação viola uma referência entre registros",
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Dados inválidos", details: err.issues })
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Arquivo muito grande (máximo 25MB)" : "Falha ao processar o arquivo"
    return res.status(400).json({ error: message })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = PRISMA_ERROR_STATUS[err.code] ?? 400
    const message = PRISMA_ERROR_MESSAGE[err.code] ?? "Erro ao processar a solicitação"
    return res.status(status).json({ error: message })
  }

  logger.error("Erro não tratado", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
  })
  return res.status(500).json({ error: "Erro interno do servidor" })
}
