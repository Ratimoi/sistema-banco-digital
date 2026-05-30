import { Router } from "express"
import { criarCartao, listarCartoes, buscarCartao, atualizarCartao, deletarCartao } from "../controllers/cartaoController"

const router = Router()

router.post("/", criarCartao)
router.get("/", listarCartoes)
router.get("/:id", buscarCartao)
router.put("/:id", atualizarCartao)
router.delete("/:id", deletarCartao)

export default router
