import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom"
import { ToastContainer } from "./components/ui"
import { isAuthenticated, clearToken } from "./services/authService"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import ClientesPage from "./pages/ClientesPage"
import ContasPage from "./pages/ContasPage"
import CartoesPage from "./pages/CartoesPage"
import EmprestimosPage from "./pages/EmprestimosPage"
import TransacoesPage from "./pages/TransacoesPage"

const navItems = [
  { to: "/", label: "Dashboard", icon: "◈" },
  { to: "/clientes", label: "Clientes", icon: "◉" },
  { to: "/contas", label: "Contas", icon: "▣" },
  { to: "/cartoes", label: "Cartões", icon: "▤" },
  { to: "/emprestimos", label: "Empréstimos", icon: "◆" },
  { to: "/transacoes", label: "Transações", icon: "⇄" },
]

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    navigate("/login", { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>BANCO</h1>
          <span>Sistema de Gestão</span>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ marginTop: "auto", border: "none", background: "none", width: "100%", textAlign: "left" }}
        >
          <span className="nav-icon">⏻</span>
          Sair
        </button>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/contas" element={<ContasPage />} />
          <Route path="/cartoes" element={<CartoesPage />} />
          <Route path="/emprestimos" element={<EmprestimosPage />} />
          <Route path="/transacoes" element={<TransacoesPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
