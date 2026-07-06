import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as logService from "../services/logService"
import { paginationQuerySchema } from "../schemas/common"

export const listarLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await logService.listarLogs(paginationQuerySchema.parse(req.query))
  return res.json(logs)
})
