import { useState, useEffect } from "react"

// ─── Toast ────────────────────────────────────────────────────────
type ToastType = { id: number; message: string; type: "success" | "error" }
let toastListeners: ((t: ToastType) => void)[] = []

export const toast = {
  success: (message: string) =>
    toastListeners.forEach((l) => l({ id: Date.now(), message, type: "success" })),
  error: (message: string) => toastListeners.forEach((l) => l({ id: Date.now(), message, type: "error" })),
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  useEffect(() => {
    const handler = (t: ToastType) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000)
    }
    toastListeners.push(handler)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handler)
    }
  }, [])

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" ? "✓" : "✕"} {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────
interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────
interface PaginationProps {
  pagina: number
  totalPaginas: number
  total: number
  onChange: (pagina: number) => void
}

export function Pagination({ pagina, totalPaginas, total, onChange }: PaginationProps) {
  if (totalPaginas <= 1) return null

  return (
    <div className="pagination">
      <span className="pagination-info">
        Página {pagina} de {totalPaginas} · {total} registros
      </span>
      <div className="pagination-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
        >
          ← Anterior
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
        >
          Próxima →
        </button>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────
interface ConfirmProps {
  message: React.ReactNode
  onConfirm: () => void
  onClose: () => void
  loading?: boolean
}

export function Confirm({ message, onConfirm, onClose, loading }: ConfirmProps) {
  return (
    <Modal
      title="Confirmar ação"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Aguarde..." : "Confirmar"}
          </button>
        </>
      }
    >
      <p className="confirm-text">{message}</p>
    </Modal>
  )
}
