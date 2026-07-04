import { Router } from "express"
import { solicitar, listar } from "../controllers/clienteEmprestimoController"
import { validate } from "../middlewares/validate"
import { solicitarEmprestimoSchema } from "../schemas/clienteEmprestimoSchema"

const router = Router()

router.post("/", validate(solicitarEmprestimoSchema), solicitar)
router.get("/", listar)

export default router
