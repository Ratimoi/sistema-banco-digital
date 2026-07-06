import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { env } from "./config/env"
import routes from "./routes"
import clienteAuthRoutes from "./routes/clienteAuthRoutes"
import clientePortalRoutes from "./routes/clientePortalRoutes"
import comunidadeRoutes from "./routes/comunidadeRoutes"
import { auth } from "./middlewares/auth"
import { requireNivel } from "./middlewares/nivel"
import { errorHandler } from "./middlewares/errorHandler"
import { logger } from "./utils/logger"

const app = express()

// O Render fica atrás de um proxy reverso e envia X-Forwarded-For; sem confiar nele, o
// express-rate-limit não consegue identificar o IP real de cada cliente (erro
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR) e acaba tratando todo mundo como um único IP, o que
// esgota o limite de tentativas para qualquer pessoa.
app.set("trust proxy", 1)

const defaultOrigins = [
  "http://localhost",
  "http://localhost:5173",
  "https://sistema-banco-digital-1.onrender.com",
  "https://sistema-banco-digital.onrender.com",
]

const allowedOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : defaultOrigins

// A API só devolve JSON, nunca HTML/scripts — CSP explícita nega tudo por padrão em vez de
// herdar os defaults do Helmet (pensados para servidores que também servem páginas).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
  }),
)
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())

const clienteAuthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 })

app.use("/api/auth", clienteAuthLimiter, clienteAuthRoutes)
app.use("/api/cliente", auth, clientePortalRoutes)
// Nível 1 (equipe) só interage com a Comunidade — precisa ser montada antes do mount geral
// abaixo (nível 2+), senão o Express nunca chegaria aqui para uma conta de nível 1.
app.use("/api/comunidade", auth, requireNivel(1), comunidadeRoutes)
app.use("/api", auth, requireNivel(2), routes)

app.use(errorHandler)

app.listen(env.PORT, "0.0.0.0", () => {
  logger.info("API iniciada", { port: env.PORT, ambiente: env.NODE_ENV })
})
