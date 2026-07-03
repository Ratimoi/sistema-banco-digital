import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { env } from "./config/env"
import authRoutes from "./routes/authRoutes"
import routes from "./routes"
import { auth } from "./middlewares/auth"
import { errorHandler } from "./middlewares/errorHandler"

const app = express()

const allowedOrigins = [
  "http://localhost",
  "http://localhost:5173",
  "https://sistema-banco-digital-1.onrender.com",
  "https://sistema-banco-digital.onrender.com",
]

app.use(helmet())
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 })

app.use("/api/auth", authLimiter, authRoutes)
app.use("/api", auth, routes)

app.use(errorHandler)

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`API rodando em http://0.0.0.0:${env.PORT}`)
  console.log(`Acessível em http://localhost:${env.PORT}`)
})
