// Logger mínimo (sem dependência externa como Sentry/Winston, que exigiria uma conta/API key):
// grava uma linha JSON por evento, com timestamp e nível, para o stdout/stderr que o Render já
// coleta como log — assim dá pra filtrar por nível ou por campo sem precisar de um serviço à parte.
type LogMeta = Record<string, unknown>

const escrever = (level: "info" | "warn" | "error", mensagem: string, meta?: LogMeta) => {
  const linha = JSON.stringify({ timestamp: new Date().toISOString(), level, mensagem, ...meta })
  if (level === "error") console.error(linha)
  else console.log(linha)
}

export const logger = {
  info: (mensagem: string, meta?: LogMeta) => escrever("info", mensagem, meta),
  warn: (mensagem: string, meta?: LogMeta) => escrever("warn", mensagem, meta),
  error: (mensagem: string, meta?: LogMeta) => escrever("error", mensagem, meta),
}
