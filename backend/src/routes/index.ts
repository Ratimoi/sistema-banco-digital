import { Router } from "express"
import clienteRoutes from "./clienteRoutes"
import contaRoutes from "./contaRoutes"
import transacaoRoutes from "./transacaoRoutes"
import emprestimoRoutes from "./emprestimoRoutes"
import cartaoRoutes from "./cartaoRoutes"
import usuarioRoutes from "./usuarioRoutes"
import logRoutes from "./logRoutes"

const router = Router()

router.use("/clientes", clienteRoutes)
router.use("/contas", contaRoutes)
router.use("/transacoes", transacaoRoutes)
router.use("/emprestimos", emprestimoRoutes)
router.use("/cartoes", cartaoRoutes)
router.use("/usuarios", usuarioRoutes)
router.use("/logs", logRoutes)

export default router
