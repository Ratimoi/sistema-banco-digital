import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma"
import { env } from "../config/env"

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
})
