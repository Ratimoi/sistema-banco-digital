-- DropForeignKey
ALTER TABLE `cartao` DROP FOREIGN KEY `Cartao_contaId_fkey`;

-- DropForeignKey
ALTER TABLE `conta` DROP FOREIGN KEY `Conta_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `emprestimo` DROP FOREIGN KEY `Emprestimo_clienteId_fkey`;

-- DropIndex
DROP INDEX `Cartao_contaId_fkey` ON `cartao`;

-- DropIndex
DROP INDEX `Conta_clienteId_fkey` ON `conta`;

-- DropIndex
DROP INDEX `Emprestimo_clienteId_fkey` ON `emprestimo`;

-- AddForeignKey
ALTER TABLE `Conta` ADD CONSTRAINT `Conta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Emprestimo` ADD CONSTRAINT `Emprestimo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cartao` ADD CONSTRAINT `Cartao_contaId_fkey` FOREIGN KEY (`contaId`) REFERENCES `Conta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
