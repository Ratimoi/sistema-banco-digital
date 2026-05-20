import { Router } from "express"
import { criarConta, listarContas, buscarConta, contasPorCliente, atualizarConta, deletarConta } from "../controllers/contaController"

const router = Router()

router.post("/", criarConta)
router.get("/", listarContas)
router.get("/cliente/:clienteId", contasPorCliente)
router.get("/:id", buscarConta)
router.put("/:id", atualizarConta)
router.delete("/:id", deletarConta)

export default router
