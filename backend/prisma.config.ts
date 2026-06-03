import "dotenv/config"
import { defineConfig, env } from "prisma/config"

// Monta DATABASE_URL a partir das variáveis separadas se ela não existir
function resolveUrl(): string {
  const url = process.env.DATABASE_URL
  if (url) return url

  const host     = process.env.DATABASE_HOST     ?? "localhost"
  const port     = process.env.DATABASE_PORT     ?? "3306"
  const user     = process.env.DATABASE_USER     ?? "root"
  const password = process.env.DATABASE_PASSWORD ?? ""
  const name     = process.env.DATABASE_NAME     ?? "api_banco"

  return `mysql://${user}:${password}@${host}:${port}/${name}`
}

process.env.DATABASE_URL = resolveUrl()

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
