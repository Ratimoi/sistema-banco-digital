import { Router } from "express"
import clienteRoutes from "./clienteRoutes"
import contaRoutes from "./contaRoutes"
import transacaoRoutes from "./transacaoRoutes"
import emprestimoRoutes from "./emprestimoRoutes"
import cartaoRoutes from "./cartaoRoutes"
import logRoutes from "./logRoutes"
import dashboardRoutes from "./dashboardRoutes"

const router = Router()

router.use("/clientes", clienteRoutes)
router.use("/contas", contaRoutes)
router.use("/transacoes", transacaoRoutes)
router.use("/emprestimos", emprestimoRoutes)
router.use("/cartoes", cartaoRoutes)
router.use("/logs", logRoutes)
router.use("/dashboard", dashboardRoutes)

export default router
