import { Router } from "express"
import { login } from "../controllers/authController"
import { validate } from "../middlewares/validate"
import { loginSchema } from "../schemas/authSchema"

const router = Router()

router.post("/login", validate(loginSchema), login)

export default router
