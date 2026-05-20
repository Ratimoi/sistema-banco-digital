-- CreateTable
CREATE TABLE `Conta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroConta` VARCHAR(191) NOT NULL,
    `saldo` DOUBLE NOT NULL DEFAULT 0,
    `tipo` VARCHAR(191) NOT NULL,
    `clienteId` INTEGER NOT NULL,

    UNIQUE INDEX `Conta_numeroConta_key`(`numeroConta`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cliente_cpf_key`(`cpf`),
    UNIQUE INDEX `Cliente_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Emprestimo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `valor` DOUBLE NOT NULL,
    `taxaJuros` DOUBLE NOT NULL,
    `parcelas` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `clienteId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cartao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `validade` VARCHAR(191) NOT NULL,
    `cvv` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `contaId` INTEGER NOT NULL,

    UNIQUE INDEX `Cartao_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `contaOrigemId` INTEGER NULL,
    `contaDestinoId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Conta` ADD CONSTRAINT `Conta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Emprestimo` ADD CONSTRAINT `Emprestimo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cartao` ADD CONSTRAINT `Cartao_contaId_fkey` FOREIGN KEY (`contaId`) REFERENCES `Conta`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_contaOrigemId_fkey` FOREIGN KEY (`contaOrigemId`) REFERENCES `Conta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_contaDestinoId_fkey` FOREIGN KEY (`contaDestinoId`) REFERENCES `Conta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
