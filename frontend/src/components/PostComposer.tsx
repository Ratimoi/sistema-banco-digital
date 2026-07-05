import { useState, useRef, ChangeEvent } from "react"
import { toast } from "./ui"

interface PostComposerProps {
  onUpload: (arquivo: File) => Promise<{ data: { url: string; tipo: string } }>
  onCreate: (conteudo: string, midia?: { url: string; tipo: string }) => Promise<unknown>
  onPosted: () => void
  placeholder?: string
}

export function PostComposer({ onUpload, onCreate, onPosted, placeholder }: PostComposerProps) {
  const [conteudo, setConteudo] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleArquivo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setArquivo(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const limparArquivo = () => {
    setArquivo(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handlePost = async () => {
    if (!conteudo.trim()) return
    setPosting(true)
    try {
      let midia: { url: string; tipo: string } | undefined
      if (arquivo) {
        const res = await onUpload(arquivo)
        midia = res.data
      }
      await onCreate(conteudo.trim(), midia)
      setConteudo("")
      limparArquivo()
      onPosted()
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao publicar")
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder={placeholder ?? "Compartilhe algo com a comunidade... (use @nome ou links)"}
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

        {previewUrl && (
          <div style={{ position: "relative", maxWidth: 240 }}>
            {arquivo?.type.startsWith("video/") ? (
              <video src={previewUrl} controls style={{ maxWidth: "100%", borderRadius: "var(--radius)" }} />
            ) : (
              <img src={previewUrl} alt="Prévia" style={{ maxWidth: "100%", borderRadius: "var(--radius)" }} />
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={limparArquivo}
              style={{ position: "absolute", top: 4, right: 4 }}
            >
              Remover
            </button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            📎 Anexar imagem/vídeo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleArquivo}
              style={{ display: "none" }}
            />
          </label>
          <button className="btn btn-primary" onClick={handlePost} disabled={posting || !conteudo.trim()}>
            {posting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  )
}
