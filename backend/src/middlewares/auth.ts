import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      clienteId?: number
      nivel?: number
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não informado" })
  }

  const token = header.slice("Bearer ".length)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & {
      nivel?: number
      tipo?: string
    }
    // Refresh tokens só servem para gerar um novo access token em /api/auth/refresh — tokens
    // emitidos antes desta mudança não têm `tipo` e continuam válidos até expirarem (8h no
    // máximo), então só barramos o caso explícito de tipo === "refresh".
    if (payload.tipo === "refresh") {
      return res.status(401).json({ error: "Token inválido ou expirado" })
    }
    req.clienteId = Number(payload.sub)
    req.nivel = payload.nivel ?? 0
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" })
  }
}
