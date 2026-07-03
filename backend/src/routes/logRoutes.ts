import { Router } from "express"
import { listarLogs } from "../controllers/logController"

const router = Router()

router.get("/", listarLogs)

export default router
