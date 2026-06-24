"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth, authFetch } from "@/contexts/auth-context"
import { Users, Dog, Calendar, Gift, ArrowRight } from "lucide-react"

export default function AppHome() {
  const { user, sub, isAdmin, hasAccess } = useAuth()
  const [counts, setCounts] = useState({ owners: 0, pets: 0, appts: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      authFetch("/api/vet?type=owners").then((r) => r.json()),
      authFetch("/api/vet?type=pets").then((r) => r.json()),
      authFetch("/api/vet?type=appointments").then((r) => r.json()),
    ]).then(([o, p, a]) => {
      setCounts({ owners: (o.items || []).length, pets: (p.items || []).length, appts: (a.items || []).length })
      const now = Date.now()
      setUpcoming((a.items || []).filter((x: any) => new Date(x.scheduled_at).getTime() >= now).slice(0, 5))
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const greeting = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0]
  const planName = isAdmin ? "Admin" : sub?.plan?.name || "Inicial"

  const cards = [
    { label: "Tutores", value: counts.owners, icon: Users, href: "/app/owners" },
    { label: "Pets", value: counts.pets, icon: Dog, href: "/app/pets" },
    { label: "Consultas", value: counts.appts, icon: Calendar, href: "/app/appointments" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Olá, {greeting} 👋</h1>
        <p className="text-slate-400 mt-1">Painel da sua clínica — plano {planName}.</p>
      </div>

      {!hasAccess && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-300 font-medium">Seu período grátis terminou</p>
            <p className="text-sm text-slate-400 mt-1">Assine um plano para continuar cadastrando e liberar todos os recursos.</p>
          </div>
          <Link href="/app/billing" className="shrink-0 px-4 py-2 rounded-lg bg-brand text-white font-medium text-sm hover:bg-brand-dark">Ver planos</Link>
        </div>
      )}
      {hasAccess && sub?.trial_active && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm text-brand-light flex items-center gap-2">
          <Gift className="size-4 shrink-0" /> Teste grátis ativo até <strong>{sub?.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString("pt-BR") : ""}</strong> — você tem acesso nível Pro.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-brand/30 transition">
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide"><c.icon className="size-4" /> {c.label}</div>
            <p className="text-2xl font-semibold text-white mt-2">{loaded ? c.value : "…"}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Próximas consultas</h2>
          <Link href="/app/appointments" className="text-sm text-brand-light hover:underline flex items-center gap-1">Ver agenda <ArrowRight className="size-3.5" /></Link>
        </div>
        {!loaded ? <p className="text-slate-500 text-sm">Carregando…</p> : upcoming.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="size-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma consulta agendada.</p>
            <Link href="/app/appointments" className="inline-block mt-3 px-4 py-2 rounded-lg bg-brand text-white font-medium text-sm hover:bg-brand-dark">Agendar consulta</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{a.pet_name || "Pet"}</p>
                  <p className="text-xs text-slate-500">{a.reason || "Consulta"}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(a.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
