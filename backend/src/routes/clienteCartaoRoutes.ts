import { Router } from "express"
import { criar, listar } from "../controllers/clienteCartaoController"
import { validate } from "../middlewares/validate"
import { createClienteCartaoSchema } from "../schemas/clienteCartaoSchema"

const router = Router()

router.post("/", validate(createClienteCartaoSchema), criar)
router.get("/", listar)

export default router
