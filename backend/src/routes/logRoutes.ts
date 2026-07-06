import { Router } from "express"
import { listarLogs } from "../controllers/logController"
import { validate } from "../middlewares/validate"
import { paginationQuerySchema } from "../schemas/common"

const router = Router()

router.get("/", validate(paginationQuerySchema, "query"), listarLogs)

export default router
