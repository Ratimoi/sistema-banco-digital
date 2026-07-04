import { Router } from "express"
import {
  criarEmprestimo,
  listarEmprestimos,
  buscarEmprestimo,
  atualizarEmprestimo,
  deletarEmprestimo,
  aprovarEmprestimo,
  rejeitarEmprestimo,
} from "../controllers/emprestimoController"
import { validate } from "../middlewares/validate"
import { requireNivel } from "../middlewares/nivel"
import { idParamSchema, paginationQuerySchema } from "../schemas/common"
import { createEmprestimoSchema, updateEmprestimoSchema } from "../schemas/emprestimoSchema"

const router = Router()

router.post("/", validate(createEmprestimoSchema), criarEmprestimo)
router.get("/", validate(paginationQuerySchema, "query"), listarEmprestimos)
router.get("/:id", validate(idParamSchema, "params"), buscarEmprestimo)
router.put("/:id", validate(idParamSchema, "params"), validate(updateEmprestimoSchema), atualizarEmprestimo)
router.delete("/:id", validate(idParamSchema, "params"), requireNivel(3), deletarEmprestimo)
router.post("/:id/aprovar", validate(idParamSchema, "params"), requireNivel(2), aprovarEmprestimo)
router.post("/:id/rejeitar", validate(idParamSchema, "params"), requireNivel(2), rejeitarEmprestimo)

export default router
