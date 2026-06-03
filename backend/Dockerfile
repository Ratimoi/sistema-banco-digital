FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY lib ./lib

ARG DATABASE_URL=mysql://user:pass@localhost:3306/dummy
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npx tsx src/server.ts"]
