# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e o projeto adere ao
[Versionamento Semântico](https://semver.org/lang/pt-BR/) (`MAJOR.MINOR.PATCH`):

- **MAJOR**: mudança incompatível (ex.: rota removida, contrato de API alterado)
- **MINOR**: nova funcionalidade compatível com versões anteriores
- **PATCH**: correção de bug compatível com versões anteriores

## Como lançar uma nova versão

1. Atualize a versão em `backend/package.json` e `frontend/package.json` (mantenha os dois sincronizados).
2. Adicione uma seção `## [X.Y.Z] - AAAA-MM-DD` neste arquivo, movendo os itens relevantes de
   `[Unreleased]` para ela.
3. Commit as mudanças, depois crie e envie a tag:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```

## [Unreleased]

## [1.1.0] - 2026-07-04

### Added
- ESLint e Prettier configurados no frontend.
- Rota `GET /api/logs` para listagem dos logs registrados.

## [1.0.0] - 2026-07-04

### Added
- Autenticação JWT para usuários administradores, com hash bcrypt de senhas.
- Validação de senha forte (mínimo 8 caracteres, minúscula, maiúscula, número e símbolo).
- Bloqueio de login após 3 tentativas inválidas (15 minutos).
- Níveis de acesso (`nivel` 1-3): exclusão de clientes/contas exige nível 3.
- Registro e exibição do último login na resposta do login.
- Recuperação de senha por e-mail com código temporário de 6 dígitos.
- Model `Log` registrando login, criação de usuário, recuperação/redefinição de senha e exclusões.
- Camada de service, validação de entrada com zod e tratamento de erro centralizado no backend.
- Testes automatizados (Vitest + Supertest) no backend.
- ESLint e Prettier configurados no backend.
- Script `prisma/createAdmin.ts` para criar o usuário administrador em produção.

### Changed
- Migração de `saldo`/`valor`/`taxaJuros` de `Float` para `Decimal`.
- Banco de dados padronizado em PostgreSQL (Supabase) em todos os ambientes (local, CI, produção).
- CORS via pacote `cors`, com `helmet` e rate limiting nas rotas de autenticação e financeiras.
- CI passa a rodar lint, build e testes no backend, e lint e build no frontend.

### Security
- Senhas e CVV de cartão nunca são devolvidos pela API.
- Correção do histórico de migrations (lock apontando para MySQL enquanto o schema já era PostgreSQL).
