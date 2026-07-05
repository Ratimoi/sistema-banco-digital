import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { env } from "./config/env"
import routes from "./routes"
import clienteAuthRoutes from "./routes/clienteAuthRoutes"
import clientePortalRoutes from "./routes/clientePortalRoutes"
import { auth } from "./middlewares/auth"
import { requireNivel } from "./middlewares/nivel"
import { errorHandler } from "./middlewares/errorHandler"

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

app.use(helmet())
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
app.use("/api", auth, requireNivel(1), routes)

app.use(errorHandler)

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`API rodando em http://0.0.0.0:${env.PORT}`)
  console.log(`Acessível em http://localhost:${env.PORT}`)
})
