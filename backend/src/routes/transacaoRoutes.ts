import { Router } from "express"
import { listarTransacoes, buscarTransacao, deposito, saque, transferencia } from "../controllers/transacaoController"

const router = Router()

// Rotas nomeadas ANTES de /:id para evitar conflito
router.post("/deposito", deposito)
router.post("/saque", saque)
router.post("/transferencia", transferencia)
router.get("/", listarTransacoes)
router.get("/:id", buscarTransacao)

export default router
