import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ alignItems: "center", textAlign: "center" }}>
        <div className="auth-logo">
          <h1 style={{ fontSize: 32 }}>BANCO</h1>
          <span>Sistema Bancário Digital</span>
        </div>
        <p style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6 }}>
          Gerencie sua conta, cartões, transações e a comunidade em um só lugar.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          <Link to="/login" className="btn btn-primary auth-submit" style={{ justifyContent: "center" }}>
            Entrar
          </Link>
          <Link to="/cadastro" className="btn btn-ghost" style={{ justifyContent: "center" }}>
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  )
}
