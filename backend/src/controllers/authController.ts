import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import * as authService from "../services/authService"

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body)
  return res.json(result)
})
