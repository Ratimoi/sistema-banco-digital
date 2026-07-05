import { Post } from "../types"
import { PostContent } from "./PostContent"

interface PostCardProps {
  post: Post
  onDelete?: (id: number) => void
}

export function PostCard({ post, onDelete }: PostCardProps) {
  return (
    <div className="card">
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{post.cliente?.nome}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono" style={{ color: "var(--text3)", fontSize: 12 }}>
              {new Date(post.createdAt).toLocaleString("pt-BR")}
            </span>
            {onDelete && (
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(post.id)}>
                Deletar
              </button>
            )}
          </div>
        </div>
        <div style={{ color: "var(--text2)", whiteSpace: "pre-wrap" }}>
          <PostContent texto={post.conteudo} />
        </div>
        {post.midiaUrl && (
          <div style={{ marginTop: 12 }}>
            {post.midiaTipo === "video" ? (
              <video src={post.midiaUrl} controls style={{ maxWidth: "100%", borderRadius: "var(--radius)" }} />
            ) : (
              <img
                src={post.midiaUrl}
                alt="Mídia da publicação"
                style={{ maxWidth: "100%", borderRadius: "var(--radius)" }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
