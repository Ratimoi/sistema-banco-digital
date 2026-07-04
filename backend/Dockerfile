FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig*.json ./
COPY scripts ./scripts
COPY src ./src

ARG DATABASE_URL=postgresql://user:pass@localhost:5432/postgres
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]