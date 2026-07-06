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
import { requireNivel } from "../middlewares/nivel"
import { idParamSchema, paginationQuerySchema } from "../schemas/common"
import { depositoSchema, saqueSchema, transferenciaSchema } from "../schemas/transacaoSchema"

const router = Router()

// Limita operações que movimentam dinheiro para reduzir o impacto de abuso/erros em massa.
const movimentacaoLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30 })

// Movimentação direta de saldo exige nível 3 — nível 2 pode gerenciar cadastros relacionados
// (clientes, contas, cartões, empréstimos), mas não mexer no dinheiro diretamente.
// Rotas nomeadas ANTES de /:id para evitar conflito
router.post("/deposito", movimentacaoLimiter, requireNivel(3), validate(depositoSchema), deposito)
router.post("/saque", movimentacaoLimiter, requireNivel(3), validate(saqueSchema), saque)
router.post(
  "/transferencia",
  movimentacaoLimiter,
  requireNivel(3),
  validate(transferenciaSchema),
  transferencia,
)
router.get("/", validate(paginationQuerySchema, "query"), listarTransacoes)
router.get("/:id", validate(idParamSchema, "params"), buscarTransacao)

export default router
