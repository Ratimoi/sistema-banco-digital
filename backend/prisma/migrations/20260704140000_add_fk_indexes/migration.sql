-- CreateIndex
CREATE INDEX "Cartao_contaId_idx" ON "Cartao"("contaId");

-- CreateIndex
CREATE INDEX "Emprestimo_clienteId_idx" ON "Emprestimo"("clienteId");

-- CreateIndex
CREATE INDEX "Log_clienteId_idx" ON "Log"("clienteId");

-- CreateIndex
CREATE INDEX "Post_clienteId_idx" ON "Post"("clienteId");

-- CreateIndex
CREATE INDEX "Transacao_contaOrigemId_idx" ON "Transacao"("contaOrigemId");

-- CreateIndex
CREATE INDEX "Transacao_contaDestinoId_idx" ON "Transacao"("contaDestinoId");
