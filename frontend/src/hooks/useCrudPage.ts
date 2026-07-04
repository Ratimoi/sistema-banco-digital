import { useCallback, useEffect, useState, ChangeEvent } from "react"
import { AxiosResponse } from "axios"
import { toast } from "../components/ui"
import { Paginated } from "../types"

interface CrudMessages {
  created: string
  updated: string
  deleted: string
  loadError: string
  saveError: string
  deleteError: string
}

interface UseCrudPageOptions<T extends { id: number }, F, P> {
  fetchPage: (page: number, limit: number) => Promise<AxiosResponse<Paginated<T>>>
  create: (data: P) => Promise<unknown>
  update: (id: number, data: P) => Promise<unknown>
  remove: (id: number) => Promise<unknown>
  emptyForm: F
  toEditForm: (item: T) => F
  buildPayload: (form: F, editing: T | null) => P
  messages: CrudMessages
  limit?: number
}

// Estado/ações compartilhados pelas telas de CRUD paginado do painel (Clientes, Contas,
// Cartões, Empréstimos) — evita repetir o mesmo load/openCreate/openEdit/handleSubmit em cada uma.
export function useCrudPage<T extends { id: number }, F, P>({
  fetchPage,
  create,
  update,
  remove,
  emptyForm,
  toEditForm,
  buildPayload,
  messages,
  limit = 20,
}: UseCrudPageOptions<T, F, P>) {
  const [dados, setDados] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [form, setForm] = useState<F>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(
    async (page: number) => {
      setLoading(true)
      try {
        const res = await fetchPage(page, limit)
        setDados(res.data.dados)
        setTotal(res.data.total)
        setPagina(res.data.pagina)
        setTotalPaginas(res.data.totalPaginas)
      } catch {
        toast.error(messages.loadError)
      } finally {
        setLoading(false)
      }
    },
    [fetchPage, limit, messages.loadError],
  )

  useEffect(() => {
    load(1)
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModal(true)
  }

  const openEdit = (item: T) => {
    setEditing(item)
    setForm(toEditForm(item))
    setModal(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = buildPayload(form, editing)
      if (editing) {
        await update(editing.id, payload)
        toast.success(messages.updated)
      } else {
        await create(payload)
        toast.success(messages.created)
      }
      setModal(false)
      load(editing ? pagina : 1)
    } catch {
      toast.error(messages.saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await remove(confirmId)
      toast.success(messages.deleted)
      setConfirmId(null)
      load(dados.length === 1 && pagina > 1 ? pagina - 1 : pagina)
    } catch {
      toast.error(messages.deleteError)
    } finally {
      setDeleting(false)
    }
  }

  const f =
    (key: keyof F) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return {
    dados,
    total,
    pagina,
    totalPaginas,
    loading,
    modal,
    setModal,
    editing,
    form,
    setForm,
    saving,
    confirmId,
    setConfirmId,
    deleting,
    changePage: load,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    f,
  }
}
