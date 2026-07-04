import { Router } from "express"
import { criarPost, listarPosts } from "../controllers/comunidadeController"
import { validate } from "../middlewares/validate"
import { createPostSchema } from "../schemas/comunidadeSchema"

const router = Router()

router.post("/", validate(createPostSchema), criarPost)
router.get("/", listarPosts)

export default router
