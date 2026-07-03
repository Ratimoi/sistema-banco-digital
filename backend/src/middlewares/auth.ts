import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuarioId?: number
      usuarioNivel?: number
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
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { nivel?: number }
    req.usuarioId = Number(payload.sub)
    req.usuarioNivel = payload.nivel ?? 1
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" })
  }
}
