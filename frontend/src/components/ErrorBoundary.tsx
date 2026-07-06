import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Erro não tratado na interface:", error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="auth-page">
        <div className="card auth-card" style={{ textAlign: "center", gap: 16 }}>
          <div className="auth-logo">
            <h1>TEENBANK</h1>
            <span>Algo deu errado</span>
          </div>
          <p style={{ color: "var(--text2)" }}>
            Ocorreu um erro inesperado nesta página. Tente recarregar — se o problema continuar,
            entre em contato com o suporte.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      </div>
    )
  }
}
