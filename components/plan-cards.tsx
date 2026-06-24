"use client"

import { Check } from "lucide-react"

export type Plan = {
  slug: string; name: string; description?: string
  price_month: number; price_year: number; features: string[]; highlighted: boolean
}

export const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })

export const FALLBACK_PLANS: Plan[] = [
  { slug: "inicial", name: "Inicial", description: "Testar / autônomo", price_month: 0, price_year: 0, highlighted: false,
    features: ["1 usuário", "Até 50 pets", "Agenda de consultas", "Prontuário básico", "Histórico de 30 dias", "Suporte da comunidade"] },
  { slug: "starter", name: "Starter", description: "Consultório", price_month: 4900, price_year: 47000, highlighted: false,
    features: ["Até 3 usuários", "Até 500 pets", "Prontuário completo", "Histórico completo", "Lembretes por e-mail", "Financeiro básico", "Suporte por e-mail"] },
  { slug: "pro", name: "Pro", description: "Clínica", price_month: 11900, price_year: 114200, highlighted: true,
    features: ["Até 10 usuários", "Pets ilimitados", "Lembretes e-mail + WhatsApp", "Financeiro completo", "Relatórios avançados", "API + integrações", "Suporte prioritário"] },
  { slug: "enterprise", name: "Enterprise", description: "Rede de clínicas", price_month: 29900, price_year: 287000, highlighted: false,
    features: ["Usuários ilimitados", "Múltiplas unidades", "Papéis e permissões avançados", "SSO e auditoria", "Exportação de relatórios", "Suporte dedicado (SLA)"] },
]

export function CycleToggle({ cycle, setCycle }: { cycle: "month" | "year"; setCycle: (c: "month" | "year") => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/5">
      <button onClick={() => setCycle("month")} className={`px-5 py-1.5 rounded-full text-sm transition ${cycle === "month" ? "bg-brand text-white font-medium" : "text-slate-400 hover:text-white"}`}>Mensal</button>
      <button onClick={() => setCycle("year")} className={`px-5 py-1.5 rounded-full text-sm transition flex items-center gap-1.5 ${cycle === "year" ? "bg-brand text-white font-medium" : "text-slate-400 hover:text-white"}`}>
        Anual <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand/25 text-brand-light">−20%</span>
      </button>
    </div>
  )
}

export function PlanCards({
  plans, cycle, currentSlug, onSelect, busy, ctaLabel,
}: {
  plans: Plan[]; cycle: "month" | "year"; currentSlug?: string
  onSelect: (slug: string) => void; busy?: string | null; ctaLabel?: (p: Plan) => string
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
      {plans.map((p) => {
        const price = cycle === "year" ? p.price_year : p.price_month
        const isCurrent = currentSlug === p.slug
        const free = p.slug === "inicial"
        return (
          <div key={p.slug} className={`relative flex flex-col rounded-2xl border p-6 ${p.highlighted ? "border-brand/50 bg-brand/[0.07] shadow-[0_0_40px_-12px_rgba(14,165,233,0.5)]" : "border-white/10 bg-white/[0.02]"}`}>
            {p.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-medium px-3 py-1 rounded-full bg-brand text-white">Mais popular</span>}
            <h3 className="text-lg font-semibold text-white">{p.name}</h3>
            {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-bold text-white">{free ? "R$ 0" : brl(cycle === "year" ? Math.round(price / 12) : price)}</span>
              {!free && <span className="text-slate-500 text-sm mb-1">/mês</span>}
            </div>
            {!free && cycle === "year" && <p className="text-xs text-slate-500 mt-1">{brl(price)} cobrado anualmente</p>}
            {free && <p className="text-xs text-slate-500 mt-1">7 dias grátis no nível Pro</p>}
            <button onClick={() => onSelect(p.slug)} disabled={isCurrent || busy === p.slug}
              className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed ${isCurrent ? "bg-white/5 text-slate-400" : p.highlighted ? "bg-brand text-white hover:bg-brand-dark" : "bg-white/10 text-white hover:bg-white/20"}`}>
              {busy === p.slug ? "Aguarde…" : isCurrent ? "Plano atual" : ctaLabel ? ctaLabel(p) : free ? "Começar grátis" : "Assinar"}
            </button>
            <ul className="mt-6 space-y-2.5 text-sm flex-1">
              {p.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-slate-300"><Check className="h-4 w-4 text-brand-light shrink-0 mt-0.5" /><span>{f}</span></li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
