-- AlterTable
ALTER TABLE "Cartao" ADD COLUMN     "limite" DECIMAL(15,2) NOT NULL;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "bloqueadoAte" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "tentativasFalhas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ultimoLogin" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conta_clienteId_key" ON "Conta"("clienteId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
