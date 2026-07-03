import { NextFunction, Request, Response } from "express"
import { ZodType } from "zod"

type Source = "body" | "params" | "query"

export const validate = (schema: ZodType, source: Source = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      return res.status(400).json({ error: "Dados inválidos", details: result.error.issues })
    }

    // Params/query são somente validados aqui (não reatribuídos: o Express 5 não
    // permite sobrescrever req.query, e req.params mantém a tipagem de string).
    if (source === "body") {
      req.body = result.data
    }
    next()
  }
}
