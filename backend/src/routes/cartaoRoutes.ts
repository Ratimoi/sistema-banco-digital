import { Router } from "express"
import {
  criarCartao,
  listarCartoes,
  buscarCartao,
  atualizarCartao,
  deletarCartao,
} from "../controllers/cartaoController"
import { validate } from "../middlewares/validate"
import { requireNivel } from "../middlewares/nivel"
import { idParamSchema } from "../schemas/common"
import { createCartaoSchema, updateCartaoSchema } from "../schemas/cartaoSchema"

const router = Router()

router.post("/", validate(createCartaoSchema), criarCartao)
router.get("/", listarCartoes)
router.get("/:id", validate(idParamSchema, "params"), buscarCartao)
router.put("/:id", validate(idParamSchema, "params"), validate(updateCartaoSchema), atualizarCartao)
router.delete("/:id", validate(idParamSchema, "params"), requireNivel(3), deletarCartao)

export default router
