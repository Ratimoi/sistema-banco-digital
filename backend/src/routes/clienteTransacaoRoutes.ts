import { Router } from "express"
import rateLimit from "express-rate-limit"
import { saque, transferencia, minhasTransacoes } from "../controllers/clienteTransacaoController"
import { validate } from "../middlewares/validate"
import { clienteSaqueSchema, clienteTransferenciaSchema } from "../schemas/clienteTransacaoSchema"

const router = Router()

const movimentacaoLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30 })

router.post("/saque", movimentacaoLimiter, validate(clienteSaqueSchema), saque)
router.post("/transferencia", movimentacaoLimiter, validate(clienteTransferenciaSchema), transferencia)
router.get("/", minhasTransacoes)

export default router
