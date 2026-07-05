import { useState, useEffect } from "react"
import { getPosts, criarPost, deletarPost, uploadMidia } from "../services/comunidadeService"
import { Confirm, toast } from "../components/ui"
import { PostComposer } from "../components/PostComposer"
import { PostCard } from "../components/PostCard"
import { Post } from "../types"

export default function ComunidadePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
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
        <PostComposer
          onUpload={uploadMidia}
          onCreate={criarPost}
          onPosted={load}
          placeholder="Compartilhe um aviso com os clientes... (use @nome ou links)"
        />

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
              <PostCard key={p.id} post={p} onDelete={setConfirmId} />
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
