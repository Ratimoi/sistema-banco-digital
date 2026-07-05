import { useState, useEffect } from "react"
import { getPosts, criarPost, uploadMidia } from "../../services/clienteComunidadeService"
import { toast } from "../../components/ui"
import { PostComposer } from "../../components/PostComposer"
import { PostCard } from "../../components/PostCard"
import { Post } from "../../types"

export default function PortalComunidadePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Comunidade</div>
          <div className="page-subtitle">Mural de publicações dos clientes</div>
        </div>
      </div>

      <div className="page-content">
        <PostComposer onUpload={uploadMidia} onCreate={criarPost} onPosted={load} />

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
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
