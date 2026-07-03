import { Router } from "express"
import rateLimit from "express-rate-limit"
import {
  listarTransacoes,
  buscarTransacao,
  deposito,
  saque,
  transferencia,
} from "../controllers/transacaoController"
import { validate } from "../middlewares/validate"
import { idParamSchema } from "../schemas/common"
import { depositoSchema, saqueSchema, transferenciaSchema } from "../schemas/transacaoSchema"

const router = Router()

// Limita operações que movimentam dinheiro para reduzir o impacto de abuso/erros em massa.
const movimentacaoLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30 })

// Rotas nomeadas ANTES de /:id para evitar conflito
router.post("/deposito", movimentacaoLimiter, validate(depositoSchema), deposito)
router.post("/saque", movimentacaoLimiter, validate(saqueSchema), saque)
router.post("/transferencia", movimentacaoLimiter, validate(transferenciaSchema), transferencia)
router.get("/", listarTransacoes)
router.get("/:id", validate(idParamSchema, "params"), buscarTransacao)

export default router
