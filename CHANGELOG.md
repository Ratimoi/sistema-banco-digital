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

### Added
- Portal de autoatendimento do cliente (`/portal/*`): cadastro (cria cliente e conta juntos),
  transações identificadas por número de cartão (saque só com cartão de débito, transferência
  resolvendo a conta de destino pelo cartão), solicitação de empréstimo via cartão de crédito
  (validado contra o limite do cartão, liberado apenas após aprovação da equipe) e mural de
  comunidade entre clientes.
- Ações de aprovar/rejeitar empréstimo na tela de Empréstimos do painel (nível 2+).
- Página inicial (`/`) com acesso único de entrada para clientes e equipe.
- Paginação (`page`/`limit`) em `GET /api/clientes`, `/api/contas`, `/api/cartoes`,
  `/api/emprestimos` e `/api/transacoes` — cada um passa a devolver
  `{ dados, total, pagina, totalPaginas }` em vez de um array sem limite. Telas do painel ganham
  controles de página.
- Endpoint `GET /api/dashboard/stats` com contagens/soma agregados via Prisma em vez do Dashboard
  buscar todas as tabelas inteiras só para exibir números.
- Variável de ambiente `CORS_ORIGINS` (opcional) para configurar as origens permitidas sem
  precisar alterar código.
- Aba "Comunidade" no painel administrativo (`/admin/comunidade`), compartilhando o mesmo mural
  de posts do portal do cliente — a equipe agora consegue ver e publicar avisos no mesmo feed.
- Exclusão de publicações da Comunidade pela equipe (nível 1+), para moderação. Clientes
  continuam sem poder editar/excluir as próprias publicações.
- Publicações da Comunidade agora aceitam imagem/vídeo anexado (upload de verdade via Supabase
  Storage — o Render não mantém arquivos entre deploys), links viram texto clicável e `@nome`
  fica destacado visualmente (sem gerar notificação nem vínculo no banco).
- Publicações da Comunidade com mais de 30 dias são apagadas automaticamente (junto com a mídia
  associada no Supabase Storage, se houver). A limpeza roda a cada listagem do mural em vez de um
  cron, já que no plano free do Render o processo pode hibernar sem tráfego.
- Layout responsivo para celular/tablet: a barra lateral (admin e portal) vira uma gaveta aberta
  por um botão hambúrguer em telas estreitas; grids de estatísticas/formulário e modais se
  ajustam para uma coluna.
- Campos com formato fixo (CPF, número/validade/CVV de cartão) agora restringem o que dá pra
  digitar em vez de só validar no envio: CPF aceita só dígitos e para em 11; número e validade
  do cartão formatam automaticamente (`0000-0000-0000-0000`, `MM/AA`) enquanto o usuário digita.
- Rate limit (10 req/min) em `POST /api/cliente/comunidade/upload`, mesmo padrão já usado nas
  rotas de movimentação financeira, para reduzir o impacto de abuso no upload de mídia.
- CSP explícita: o backend (API só-JSON) nega tudo por padrão via Helmet; o frontend (nginx)
  declara `script-src`/`style-src`/`img-src`/`connect-src` explicitamente em vez de depender só
  de CORS para restringir de onde a página pode carregar recursos.
- Paginação em `GET /api/logs`, seguindo o mesmo padrão (`page`/`limit` →
  `{ dados, total, pagina, totalPaginas }`) já usado nos demais endpoints de listagem.
- Índice (`@@index`) em `Transacao.createdAt` e `Post.createdAt`, usados em consultas ordenadas
  por data e na limpeza automática da Comunidade.
- Refresh token: o access token passa a expirar em 1h (antes eram 8h), com um refresh token de
  7 dias emitido junto no login. Novo endpoint `POST /api/auth/refresh` emite um novo access
  token a partir do refresh token; o frontend renova automaticamente em qualquer 401 e só desloga
  se o refresh também falhar.
- Testes unitários para os services que ainda não tinham cobertura (`cartaoService`,
  `clienteCartaoService`, `clienteService`, `contaService`, `dashboardService`, `emailService`,
  `logService`, `uploadService`) e para o middleware de autenticação.
- Acessibilidade: campos de formulário usam associação implícita `<label>` (rótulo e input no
  mesmo elemento) em vez de apenas texto solto ao lado do input; mídia da Comunidade (imagem e
  vídeo) ganha `alt`/`aria-label` descritivos.
- Error boundary no frontend: um erro de render em qualquer tela agora mostra uma página de erro
  com opção de recarregar, em vez de deixar a interface em branco.
- Logging estruturado básico no backend (`utils/logger.ts`): eventos e erros não tratados são
  gravados como uma linha JSON (timestamp, nível, mensagem) em vez de `console.log`/`console.error`
  soltos — sem integrar um serviço externo como Sentry, que exigiria conta/API key própria.

### Changed
- Frontend: tipos TypeScript (`Cliente`, `Conta`, `Cartao`, `Emprestimo`, `Transacao`) no lugar de
  `any` nas telas do painel; hook `useCrudPage` compartilhado entre Clientes/Contas/Cartões/
  Empréstimos para reduzir a duplicação de load/criar/editar/deletar.
- **Unificação de contas**: o model `Usuario` foi removido. Toda conta agora é um `Cliente`, que
  ganhou um campo `nivel` (0 = cliente comum, 1-3 = equipe — a "credencial especial"). Existe um
  único login (`/api/auth/login`); após autenticar, contas com `nivel > 0` acessam o painel
  administrativo (`/admin`) e as demais o portal do cliente (`/portal`).
- A tabela `Log` passa a referenciar `Cliente` em vez de `Usuario`.
- Cadastro/edição de cliente pelo painel administrativo passa a exigir senha forte (antes aceitava
  senhas fracas de 6 caracteres) e ganha um campo "Nível" para conceder a credencial de equipe.
- Painel administrativo movido de `/` para `/admin/*`; páginas de cadastro/recuperação de senha do
  cliente movidas de `/portal/cadastro` etc. para `/cadastro`, já que são públicas (pré-login).
- Redesign visual (Inter para texto corrido, paleta refinada) compartilhado pelos dois portais.

### Removed
- Endpoint `/api/usuarios` (CRUD de administradores) — conceder a credencial de equipe agora é
  feito editando o `nivel` de um `Cliente` existente pela tela de Clientes do painel.

### Changed
- Refatora os clientes HTTP do frontend (`api.ts`, `clienteApi.ts`, `authApi.ts`) para compartilhar
  uma única factory (`httpClient.ts`), eliminando a duplicação do interceptor de token/401.
- Consultas de transações de uma conta (`GET /api/contas/:id`, `GET /api/contas/cliente/:clienteId`)
  agora trazem só as 50 mais recentes, evitando carregar o histórico inteiro sem limite.

### Security
- Corrige uma brecha introduzida pela unificação de login: rotas administrativas (`/api/*`, exceto
  `/api/auth`) agora exigem explicitamente `nivel >= 1`, e não apenas um token válido — sem essa
  checagem, qualquer cliente autenticado poderia acessar endpoints administrativos diretamente.
- Exclusão de cartão e de empréstimo agora exige nível 3, igual à exclusão de cliente/conta —
  antes qualquer conta de equipe (nível 1+) podia excluir esses registros.
- Adiciona índice (`@@index`) nas colunas de chave estrangeira que não tinham (`Log.clienteId`,
  `Emprestimo.clienteId`, `Cartao.contaId`, `Post.clienteId`, `Transacao.contaOrigemId`,
  `Transacao.contaDestinoId`) — o Postgres, diferente do MySQL, não cria índice automático
  em coluna de chave estrangeira.

### Fixed
- Envio de e-mail (recuperação de senha e relatório de transações) nunca funcionava em produção:
  o Render bloqueia conexões de saída na porta 465 (SMTP), tanto por IPv4 quanto IPv6 — o
  sintoma inicial parecia ser só IPv6, mas testar em produção confirmou que a porta inteira está
  bloqueada. Substitui o envio via SMTP/nodemailer por [Resend](https://resend.com), que entrega
  por HTTPS (porta 443, a mesma já usada pelo resto da API). Remove a dependência `nodemailer`
  (que também tinha uma vulnerabilidade de severidade alta em aberto).

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
