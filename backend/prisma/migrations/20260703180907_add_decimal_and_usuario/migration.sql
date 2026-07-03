/*
  Warnings:

  - You are about to alter the column `saldo` on the `Conta` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `valor` on the `Emprestimo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `taxaJuros` on the `Emprestimo` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `valor` on the `Transacao` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.

*/
-- DropForeignKey
ALTER TABLE "Cartao" DROP CONSTRAINT "Cartao_contaId_fkey";

-- DropForeignKey
ALTER TABLE "Conta" DROP CONSTRAINT "Conta_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Emprestimo" DROP CONSTRAINT "Emprestimo_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_contaDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_contaOrigemId_fkey";

-- AlterTable
ALTER TABLE "Conta" ALTER COLUMN "saldo" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "Emprestimo" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "taxaJuros" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "Transacao" ALTER COLUMN "valor" SET DATA TYPE DECIMAL(15,2);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Conta" ADD CONSTRAINT "Conta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emprestimo" ADD CONSTRAINT "Emprestimo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartao" ADD CONSTRAINT "Cartao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaOrigemId_fkey" FOREIGN KEY ("contaOrigemId") REFERENCES "Conta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_contaDestinoId_fkey" FOREIGN KEY ("contaDestinoId") REFERENCES "Conta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
