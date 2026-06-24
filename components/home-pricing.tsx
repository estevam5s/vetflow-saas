"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlanCards, CycleToggle, FALLBACK_PLANS, Plan } from "@/components/plan-cards"

export function HomePricing() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [cycle, setCycle] = useState<"month" | "year">("month")

  useEffect(() => {
    fetch("/api/plans").then((r) => r.json()).then((d) => { if (d.plans?.length) setPlans(d.plans) }).catch(() => {})
  }, [])

  return (
    <section id="planos" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand-light">Planos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">Preço justo para cada clínica</h2>
          <p className="mt-4 text-slate-400">Comece com <strong className="text-white">7 dias grátis no nível Pro</strong>, sem cartão. Cancele quando quiser — garantia de reembolso de 7 dias. Sem cobrança por armazenamento.</p>
          <div className="mt-8 flex justify-center"><CycleToggle cycle={cycle} setCycle={setCycle} /></div>
        </div>
        <div className="mt-14">
          <PlanCardsHome plans={plans} cycle={cycle} />
        </div>
        <p className="mt-8 text-center text-xs text-slate-600">Pagamento seguro via Stripe · Nota fiscal automática · Garantia de reembolso de 7 dias</p>
      </div>
    </section>
  )
}

function PlanCardsHome({ plans, cycle }: { plans: Plan[]; cycle: "month" | "year" }) {
  return <PlanCards plans={plans} cycle={cycle} onSelect={() => { window.location.href = "/login?mode=signup" }} ctaLabel={(p) => (p.slug === "inicial" ? "Começar grátis" : "Assinar")} />
}
