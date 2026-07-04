import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="auth-page">
      <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="auth-logo">
          <h1 style={{ fontSize: 32 }}>BANCO</h1>
          <span>Sistema Bancário Digital</span>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card-title">Sou cliente</div>
            <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6 }}>
              Acesse sua conta, cartões, transações e a comunidade, ou crie um cadastro novo.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
              <Link to="/portal/login" className="btn btn-primary" style={{ justifyContent: "center" }}>
                Entrar
              </Link>
              <Link to="/portal/cadastro" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                Criar conta
              </Link>
            </div>
          </div>

          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card-title">Sou da equipe</div>
            <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6 }}>
              Painel administrativo para gestão de clientes, contas, cartões, empréstimos e transações.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
              <Link to="/login" className="btn btn-primary" style={{ justifyContent: "center" }}>
                Acessar painel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
