import { Router } from "express"
import clienteCartaoRoutes from "./clienteCartaoRoutes"
import clienteTransacaoRoutes from "./clienteTransacaoRoutes"
import clienteEmprestimoRoutes from "./clienteEmprestimoRoutes"
import comunidadeRoutes from "./comunidadeRoutes"
import { minhaConta } from "../controllers/clienteContaController"

const router = Router()

router.get("/minha-conta", minhaConta)
router.use("/cartoes", clienteCartaoRoutes)
router.use("/transacoes", clienteTransacaoRoutes)
router.use("/emprestimos", clienteEmprestimoRoutes)
router.use("/comunidade", comunidadeRoutes)

export default router
