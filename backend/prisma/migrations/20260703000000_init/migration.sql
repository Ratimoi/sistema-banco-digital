CREATE TABLE "Cliente" (
  "id"        SERIAL PRIMARY KEY,
  "nome"      TEXT NOT NULL,
  "cpf"       TEXT NOT NULL UNIQUE,
  "email"     TEXT NOT NULL UNIQUE,
  "senha"     TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Conta" (
  "id"          SERIAL PRIMARY KEY,
  "numeroConta" TEXT NOT NULL UNIQUE,
  "saldo"       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tipo"        TEXT NOT NULL,
  "clienteId"   INTEGER NOT NULL,
  CONSTRAINT "Conta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE
);

CREATE TABLE "Emprestimo" (
  "id"        SERIAL PRIMARY KEY,
  "valor"     DOUBLE PRECISION NOT NULL,
  "taxaJuros" DOUBLE PRECISION NOT NULL,
  "parcelas"  INTEGER NOT NULL,
  "status"    TEXT NOT NULL,
  "clienteId" INTEGER NOT NULL,
  CONSTRAINT "Emprestimo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE
);

CREATE TABLE "Cartao" (
  "id"       SERIAL PRIMARY KEY,
  "numero"   TEXT NOT NULL UNIQUE,
  "validade" TEXT NOT NULL,
  "cvv"      TEXT NOT NULL,
  "tipo"     TEXT NOT NULL,
  "contaId"  INTEGER NOT NULL,
  CONSTRAINT "Cartao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE CASCADE
);

CREATE TABLE "Transacao" (
  "id"             SERIAL PRIMARY KEY,
  "tipo"           TEXT NOT NULL,
  "valor"          DOUBLE PRECISION NOT NULL,
  "descricao"      TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "contaOrigemId"  INTEGER,
  "contaDestinoId" INTEGER,
  CONSTRAINT "Transacao_contaOrigemId_fkey"  FOREIGN KEY ("contaOrigemId")  REFERENCES "Conta"("id") ON DELETE SET NULL,
  CONSTRAINT "Transacao_contaDestinoId_fkey" FOREIGN KEY ("contaDestinoId") REFERENCES "Conta"("id") ON DELETE SET NULL
);
