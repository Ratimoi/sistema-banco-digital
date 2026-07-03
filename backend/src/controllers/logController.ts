import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as logService from "../services/logService"

export const listarLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await logService.listarLogs()
  return res.json(logs)
})
