"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"

export type FieldDef = {
  key: string
  label: string
  type?: "text" | "email" | "tel" | "date" | "datetime-local" | "number" | "textarea" | "select"
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  full?: boolean
}

export type ColumnDef = { key: string; label: string; render?: (row: any) => React.ReactNode }

export function CrudPage({
  type, title, subtitle, fields, columns, emptyText, selectSources,
}: {
  type: string
  title: string
  subtitle: string
  fields: FieldDef[]
  columns: ColumnDef[]
  emptyText: string
  selectSources?: Record<string, string> // fieldKey -> related type to load options (id/name)
}) {
  const [items, setItems] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const [related, setRelated] = useState<Record<string, { value: string; label: string }[]>>({})

  const load = () => authFetch(`/api/vet?type=${type}`).then((r) => r.json()).then((d) => { setItems(d.items || []); setLoaded(true) })
  useEffect(() => {
    load()
    if (selectSources) {
      Object.entries(selectSources).forEach(([fieldKey, relType]) => {
        authFetch(`/api/vet?type=${relType}`).then((r) => r.json()).then((d) => {
          setRelated((prev) => ({ ...prev, [fieldKey]: (d.items || []).map((x: any) => ({ value: x.id, label: x.name })) }))
        })
      })
    }
  }, []) // eslint-disable-line

  const openNew = () => { setEditing(null); setForm({}); setErr(""); setOpen(true) }
  const openEdit = (row: any) => { setEditing(row); setForm({ ...row }); setErr(""); setOpen(true) }

  const save = async () => {
    setSaving(true); setErr("")
    const method = editing ? "PATCH" : "POST"
    const body = editing ? { ...form, id: editing.id } : form
    const res = await authFetch(`/api/vet?type=${type}`, { method, body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(data.error || "Erro ao salvar"); return }
    setOpen(false); load()
  }
  const remove = async (id: string) => {
    if (!confirm("Remover este registro?")) return
    await authFetch(`/api/vet?type=${type}&id=${id}`, { method: "DELETE" }); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium text-sm flex items-center gap-2"><Plus className="size-4" /> Adicionar</button>
      </div>

      {!loaded ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 className="size-4 animate-spin" /> Carregando…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-12 text-center">
          <p className="text-slate-400">{emptyText}</p>
          <button onClick={openNew} className="inline-block mt-3 px-4 py-2 rounded-lg bg-brand text-white font-medium text-sm hover:bg-brand-dark">+ Adicionar</button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-600">
                  {columns.map((c) => <th key={c.key} className="text-left font-bold px-5 py-3">{c.label}</th>)}
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    {columns.map((c) => <td key={c.key} className="px-5 py-3 text-slate-300">{c.render ? c.render(row) : (row[c.key] ?? "—")}</td>)}
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(row)} className="text-slate-500 hover:text-brand-light mr-3"><Pencil className="size-4" /></button>
                      <button onClick={() => remove(row.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="size-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a1422] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">{editing ? "Editar" : "Novo"} {title.replace(/s$/, "").toLowerCase()}</h3>
            {err && <p className="mb-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{err}</p>}
            <div className="grid grid-cols-2 gap-3">
              {fields.map((f) => {
                const opts = f.type === "select" ? (related[f.key] || f.options || []) : f.options
                return (
                  <div key={f.key} className={f.full || f.type === "textarea" ? "col-span-2" : ""}>
                    <label className="text-xs text-slate-400">{f.label}{f.required ? " *" : ""}</label>
                    {f.type === "textarea" ? (
                      <textarea value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-brand/50 resize-none" />
                    ) : f.type === "select" ? (
                      <select value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-brand/50">
                        <option value="">— selecione —</option>
                        {(opts || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input type={f.type || "text"} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-brand/50" />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium text-sm disabled:opacity-50">{saving ? "Salvando…" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
