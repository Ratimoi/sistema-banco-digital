-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "bloqueadoAte" TIMESTAMP(3),
ADD COLUMN     "nivel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "tentativasFalhas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ultimoLogin" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
