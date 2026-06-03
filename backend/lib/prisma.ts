import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma";

function getDbConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
    if (!match) throw new Error("DATABASE_URL inválida. Formato: mysql://user:pass@host:3306/db");
    const [, user, password, host, port, database] = match;
    return { host, user, password, database, port: port ? parseInt(port) : 3306 };
  }
  return {
    host:     process.env.DATABASE_HOST     ?? "localhost",
    user:     process.env.DATABASE_USER     ?? "root",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME     ?? "api_banco",
    port:     parseInt(process.env.DATABASE_PORT ?? "3306"),
  };
}

const adapter = new PrismaMariaDb({ ...getDbConfig(), connectionLimit: 5 });

const prisma = new PrismaClient({ adapter, log: ["query", "info", "warn", "error"] });

export { prisma };
