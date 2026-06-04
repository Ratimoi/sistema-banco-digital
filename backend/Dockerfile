FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY lib ./lib

ARG DATABASE_URL=postgresql://user:pass@localhost:5432/postgres
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]