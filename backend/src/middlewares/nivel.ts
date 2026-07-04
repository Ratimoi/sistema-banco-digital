import { NextFunction, Request, Response } from "express"

export const requireNivel = (minimo: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req.nivel ?? 0) < minimo) {
      return res
        .status(403)
        .json({ error: `Ação permitida apenas para usuários de nível ${minimo} ou superior` })
    }
    next()
  }
}
