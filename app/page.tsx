import Link from "next/link"
import { PawPrint, Calendar, FileText, Users, Wallet, Bell, ShieldCheck, ArrowRight, Check } from "lucide-react"
import { HomePricing } from "@/components/home-pricing"

const FEATURES = [
  { icon: Users, title: "Tutores e pets", desc: "Cadastro completo de tutores e seus pets — espécie, raça, peso, histórico e observações." },
  { icon: Calendar, title: "Agenda de consultas", desc: "Marque, confirme e acompanhe consultas com status em tempo real." },
  { icon: FileText, title: "Prontuário eletrônico", desc: "Anamnese, diagnóstico, tratamento e prescrição — todo o histórico clínico do pet." },
  { icon: Bell, title: "Lembretes", desc: "Avise tutores sobre consultas e vacinas por e-mail e WhatsApp (planos pagos)." },
  { icon: Wallet, title: "Financeiro", desc: "Controle receitas e despesas da clínica com relatórios claros." },
  { icon: ShieldCheck, title: "Seguro e isolado", desc: "Cada clínica tem seus dados isolados (multi-tenant) e em conformidade com a LGPD." },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060d17] text-slate-200">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#060d17]/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <div className="size-8 rounded-lg bg-brand grid place-items-center"><PawPrint className="size-5 text-white" /></div>
            VetFlow
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-400">
            <a href="#recursos" className="hover:text-white transition">Recursos</a>
            <a href="#planos" className="hover:text-white transition">Planos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white">Entrar</Link>
            <Link href="/login?mode=signup" className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium transition">Começar grátis</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-brand/15 blur-[120px]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs text-brand-light">
            <PawPrint className="size-3.5" /> Sistema de gestão para clínicas veterinárias
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-white">
            A sua clínica veterinária, <span className="text-brand-light">organizada</span>.
          </h1>
          <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
            Tutores, pets, agenda, prontuário eletrônico e financeiro num só lugar. Menos papelada, mais tempo para cuidar dos pacientes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login?mode=signup" className="px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium flex items-center justify-center gap-2">
              Começar grátis <ArrowRight className="size-4" />
            </Link>
            <a href="#planos" className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white font-medium">Ver planos</a>
          </div>
          <p className="mt-4 text-xs text-slate-600">7 dias grátis no nível Pro · Sem cartão · Cancele quando quiser</p>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="px-6 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand-light">Recursos</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">Tudo o que a clínica precisa</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
                <div className="h-11 w-11 rounded-xl bg-brand/10 grid place-items-center text-brand-light mb-4"><f.icon className="size-6" /></div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomePricing />

      {/* CTA */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Pronto para organizar sua clínica?</h2>
          <p className="mt-4 text-slate-400">Crie sua conta e comece com 7 dias grátis no nível Pro.</p>
          <Link href="/login?mode=signup" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium">
            Criar conta grátis <ArrowRight className="size-4" />
          </Link>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {["Sem cartão de crédito", "Reembolso de 7 dias", "Suporte em português"].map((x) => (
              <li key={x} className="flex items-center gap-1.5"><Check className="size-4 text-brand-light" /> {x}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© 2026 VetFlow · Gestão para clínicas veterinárias</span>
          <Link href="/login" className="hover:text-white">Entrar</Link>
        </div>
      </footer>
    </main>
  )
}
