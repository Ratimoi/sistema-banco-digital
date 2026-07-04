-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "nivel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "usuarioId",
ADD COLUMN     "clienteId" INTEGER;

-- DropTable
DROP TABLE "Usuario";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
