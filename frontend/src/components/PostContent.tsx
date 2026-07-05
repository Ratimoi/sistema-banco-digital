const LINK_OU_MENCAO = /(https?:\/\/[^\s]+)|(@[\p{L}0-9_]+)/gu

// Detecta links (renderizados como <a> clicável) e @menções (destacadas) no texto livre de um
// post — sem validar se a menção corresponde a um cliente real, é só um destaque visual.
export function PostContent({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  let ultimoIndex = 0
  let match: RegExpExecArray | null
  const regex = new RegExp(LINK_OU_MENCAO)

  while ((match = regex.exec(texto))) {
    if (match.index > ultimoIndex) {
      partes.push(texto.slice(ultimoIndex, match.index))
    }
    if (match[1]) {
      partes.push(
        <a
          key={match.index}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)" }}
        >
          {match[1]}
        </a>,
      )
    } else if (match[2]) {
      partes.push(
        <span key={match.index} style={{ color: "var(--blue)", fontWeight: 600 }}>
          {match[2]}
        </span>,
      )
    }
    ultimoIndex = match.index + match[0].length
  }
  if (ultimoIndex < texto.length) {
    partes.push(texto.slice(ultimoIndex))
  }

  return <>{partes}</>
}
