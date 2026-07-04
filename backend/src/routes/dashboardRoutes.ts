import { Router } from "express"
import { obterStats } from "../controllers/dashboardController"

const router = Router()

router.get("/stats", obterStats)

export default router
