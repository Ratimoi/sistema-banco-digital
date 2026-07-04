import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as dashboardService from "../services/dashboardService"

export const obterStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.obterStats()
  return res.json(stats)
})
