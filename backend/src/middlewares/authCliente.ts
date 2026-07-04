import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      clienteId?: number
    }
  }
}

export const authCliente = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não informado" })
  }

  const token = header.slice("Bearer ".length)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { tipo?: string }
    if (payload.tipo !== "cliente") {
      return res.status(401).json({ error: "Token inválido para este recurso" })
    }
    req.clienteId = Number(payload.sub)
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" })
  }
}
