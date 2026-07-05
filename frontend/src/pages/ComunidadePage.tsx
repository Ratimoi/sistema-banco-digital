import { useState, useEffect } from "react"
import { getPosts, criarPost, deletarPost } from "../services/comunidadeService"
import { Confirm, toast } from "../components/ui"
import { Post } from "../types"

export default function ComunidadePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [conteudo, setConteudo] = useState("")
  const [posting, setPosting] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      const res = await getPosts()
      setPosts(res.data)
    } catch {
      toast.error("Erro ao carregar comunidade")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handlePost = async () => {
    if (!conteudo.trim()) return
    setPosting(true)
    try {
      await criarPost(conteudo.trim())
      setConteudo("")
      load()
    } catch {
      toast.error("Erro ao publicar")
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await deletarPost(confirmId)
      toast.success("Publicação deletada!")
      setConfirmId(null)
      load()
    } catch {
      toast.error("Erro ao deletar publicação")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Comunidade</div>
          <div className="page-subtitle">Mural de publicações dos clientes</div>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Compartilhe um aviso com os clientes..."
              rows={3}
              style={{
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                padding: 12,
                resize: "vertical",
              }}
            />
            <button
              className="btn btn-primary"
              style={{ alignSelf: "flex-end" }}
              onClick={handlePost}
              disabled={posting || !conteudo.trim()}
            >
              {posting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Carregando...</div>
        ) : posts.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">💬</div>
              <div className="empty-text">Nenhuma publicação ainda</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((p) => (
              <div className="card" key={p.id}>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{p.cliente?.nome}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="mono" style={{ color: "var(--text3)", fontSize: 12 }}>
                        {new Date(p.createdAt).toLocaleString("pt-BR")}
                      </span>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmId(p.id)}>
                        Deletar
                      </button>
                    </div>
                  </div>
                  <div style={{ color: "var(--text2)" }}>{p.conteudo}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmId && (
        <Confirm
          message="Deseja deletar esta publicação?"
          onConfirm={handleDelete}
          onClose={() => setConfirmId(null)}
          loading={deleting}
        />
      )}
    </>
  )
}
