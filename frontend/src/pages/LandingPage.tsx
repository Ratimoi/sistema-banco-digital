import { Link } from "react-router-dom"

interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: "▣",
    title: "Contas corrente e poupança",
    description: "Abra sua conta em segundos e acompanhe o saldo em tempo real.",
  },
  {
    icon: "▤",
    title: "Cartões de débito e crédito",
    description: "Peça cartões com limite próprio — débito para o dia a dia, crédito para empréstimos.",
  },
  {
    icon: "⇄",
    title: "Depósitos, saques e transferências",
    description: "Movimente dinheiro identificando a conta pelo número do cartão, sem burocracia.",
  },
  {
    icon: "◆",
    title: "Empréstimos sob demanda",
    description: "Solicite crédito pelo cartão e acompanhe a aprovação da equipe até o valor cair na conta.",
  },
  {
    icon: "💬",
    title: "Comunidade entre clientes",
    description: "Compartilhe fotos, vídeos e links num mural em comum — com menções e moderação da equipe.",
  },
  {
    icon: "◈",
    title: "Painel completo para a equipe",
    description: "Gestão de clientes, contas e operações com níveis de acesso — cada credencial vê só o que precisa.",
  },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--accent)", fontSize: 20 }}>
          BANCO
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/login" className="btn btn-ghost">
            Entrar
          </Link>
          <Link to="/cadastro" className="btn btn-primary">
            Criar conta
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 32px 96px" }}>
        <section style={{ textAlign: "center", marginBottom: 80 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.5px",
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            Um banco digital completo,
            <br />
            do cadastro à comunidade.
          </h1>
          <p
            style={{
              color: "var(--text2)",
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            Conta, cartão, transações, empréstimos e um mural social entre clientes — tudo em um
            só lugar, com um painel de gestão dedicado para a equipe do banco.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/cadastro" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
              Criar conta grátis
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: "10px 20px", fontSize: 14 }}>
              Já tenho conta
            </Link>
          </div>
        </section>

        <section>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {features.map((feature) => (
              <div key={feature.title} className="card" style={{ padding: 24 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "var(--radius)",
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    fontSize: 18,
                    marginBottom: 14,
                  }}
                >
                  {feature.icon}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>
                  {feature.title}
                </div>
                <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6 }}>{feature.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 80, textAlign: "center" }}>
          <div className="card" style={{ padding: "40px 32px", display: "inline-block", maxWidth: 480 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Pronto para começar?
            </div>
            <p style={{ color: "var(--text2)", fontSize: 13, marginBottom: 20 }}>
              Crie sua conta em menos de um minuto e explore todas as funcionalidades.
            </p>
            <Link to="/cadastro" className="btn btn-primary" style={{ justifyContent: "center", width: "100%" }}>
              Criar conta
            </Link>
          </div>
        </section>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "24px 32px",
          borderTop: "1px solid var(--border)",
          color: "var(--text3)",
          fontSize: 12,
        }}
      >
        Sistema Bancário Digital — projeto acadêmico (SENAC)
      </footer>
    </div>
  )
}
