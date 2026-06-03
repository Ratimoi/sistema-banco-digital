import express from "express"
import routes from "./routes"

const app = express()
const PORT = process.env.PORT ?? 3000

const allowedOrigins = [
  "http://localhost",
  "http://localhost:5173",
  "https://sistema-banco-digital-1.onrender.com",
  "https://sistema-banco-digital.onrender.com",
]

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    res.sendStatus(204)
    return
  }

  next()
})

app.use(express.json())
app.use("/api", routes)

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
