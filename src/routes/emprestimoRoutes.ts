import { Router } from "express"
import { criarEmprestimo, listarEmprestimos } from "../controllers/emprestimoController"

const router = Router()

router.post("/", criarEmprestimo)
router.get("/", listarEmprestimos)

export default router