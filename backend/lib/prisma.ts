import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg({ pool });

const prisma = new PrismaClient({ adapter, log: ["query", "info", "warn", "error"] });

export { prisma };
