import { Router } from "express"
import { criarCartao, listarCartoes } from "../controllers/cartaoController"

const router = Router()

router.post("/", criarCartao)
router.get("/", listarCartoes)

export default router