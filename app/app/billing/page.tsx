"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { useAuth, authFetch } from "@/contexts/auth-context"
import { PlanCards, CycleToggle, FALLBACK_PLANS } from "@/components/plan-cards"

function BillingInner() {
  const { sub, isAdmin, reload } = useAuth()
  const params = useSearchParams()
  const [cycle, setCycle] = useState<"month" | "year">("month")
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    if (params.get("success")) { setMsg("✅ Assinatura ativada! Pode levar alguns segundos para atualizar."); reload() }
    if (params.get("canceled")) setMsg("Pagamento cancelado.")
  }, [params, reload])

  const checkout = async (slug: string) => {
    if (slug === "inicial") return
    setBusy(slug)
    const res = await authFetch("/api/checkout", { method: "POST", body: JSON.stringify({ slug, cycle }) })
    const data = await res.json()
    setBusy(null)
    if (data.url) window.location.href = data.url; else setMsg(data.error || "Erro ao iniciar checkout")
  }
  const portal = async () => {
    setBusy("portal")
    const res = await authFetch("/api/portal", { method: "POST" })
    const data = await res.json()
    setBusy(null)
    if (data.url) window.location.href = data.url; else setMsg(data.error || "Nenhuma assinatura para gerenciar")
  }

  const plans = sub?.plans?.length ? sub.plans : FALLBACK_PLANS
  const currentSlug = isAdmin ? "enterprise" : sub?.subscription?.plan_slug || "inicial"
  const subscription = sub?.subscription
  const refundUntil = subscription?.refund_eligible_until ? new Date(subscription.refund_eligible_until) : null
  const refundActive = refundUntil && refundUntil > new Date()
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR") : null

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-semibold text-white">Assinatura</h1><p className="text-slate-400 mt-1 text-sm">Gerencie seu plano, pagamentos e reembolso.</p></div>
      {msg && <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm text-brand-light">{msg}</div>}

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Plano atual</p>
          <p className="text-xl font-semibold text-white mt-1">{isAdmin ? "Admin (acesso total)" : sub?.plan?.name || "Inicial"}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            {subscription?.status && <span>Status: <span className="text-slate-300">{subscription.status}</span></span>}
            {periodEnd && <span>Renova em: <span className="text-slate-300">{periodEnd}</span></span>}
            {sub?.trial_active && sub?.trial_ends_at && <span className="text-brand-light">Teste Pro até {new Date(sub.trial_ends_at).toLocaleDateString("pt-BR")}</span>}
          </div>
        </div>
        {subscription?.stripe_customer_id && (
          <button onClick={portal} disabled={busy === "portal"} className="shrink-0 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition disabled:opacity-50">{busy === "portal" ? "Abrindo…" : "Gerenciar pagamento"}</button>
        )}
      </div>

      {refundActive && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm text-sky-300 flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0" /> Garantia de reembolso ativa até <strong>{refundUntil!.toLocaleDateString("pt-BR")}</strong> (7 dias). Cancele pelo portal para reembolso integral.
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-white">Escolha seu plano</h2>
        <CycleToggle cycle={cycle} setCycle={setCycle} />
      </div>
      <PlanCards plans={plans} cycle={cycle} currentSlug={currentSlug} onSelect={checkout} busy={busy} />
      <p className="text-xs text-slate-600">Pagamentos processados com segurança pela Stripe. Cancele quando quiser. Garantia de reembolso de 7 dias. Sem cobrança por armazenamento.</p>
    </div>
  )
}

export default function BillingPage() {
  return <Suspense fallback={<div className="text-slate-500">Carregando…</div>}><BillingInner /></Suspense>
}
