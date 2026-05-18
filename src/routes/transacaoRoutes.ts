import { Router } from "express";
import { deposito, saque, transferencia } from "../controllers/transacaoController";

const router = Router();

router.post("/deposito", deposito);
router.post("/saque", saque);
router.post("/transferencia", transferencia);

export default router;