import { Router } from "express"
import { listarTransacoes, buscarTransacao, deposito, saque, transferencia } from "../controllers/transacaoController"

const router = Router()

router.get("/", listarTransacoes)
router.get("/:id", buscarTransacao)
router.post("/deposito", deposito)
router.post("/saque", saque)
router.post("/transferencia", transferencia)

export default router
