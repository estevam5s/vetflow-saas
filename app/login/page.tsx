"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Mail, Lock, User, Building2, Loader2, PawPrint, Check } from "lucide-react"

function EyeBall({ size = 22, pupil = 9, max = 6, blink = false, cover = false }: { size?: number; pupil?: number; max?: number; blink?: boolean; cover?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [m, setM] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setM({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])
  let px = 0, py = 0
  if (ref.current && !cover) {
    const r = ref.current.getBoundingClientRect()
    const dx = m.x - (r.left + r.width / 2), dy = m.y - (r.top + r.height / 2)
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), max)
    const a = Math.atan2(dy, dx); px = Math.cos(a) * dist; py = Math.sin(a) * dist
  }
  const closed = blink || cover
  return (
    <div ref={ref} className="rounded-full flex items-center justify-center transition-all duration-150" style={{ width: size, height: closed ? 2 : size, backgroundColor: "white", overflow: "hidden" }}>
      {!closed && <div className="rounded-full" style={{ width: pupil, height: pupil, backgroundColor: "#0c4a6e", transform: `translate(${px}px, ${py}px)`, transition: "transform 0.1s ease-out" }} />}
    </div>
  )
}

function Character({ color, left, width, height, blink, cover, faceTop = 46 }: { color: string; left: number; width: number; height: number; blink: boolean; cover?: boolean; faceTop?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [m, setM] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setM({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])
  let skew = 0, fx = 0, fy = 0
  if (ref.current) {
    const r = ref.current.getBoundingClientRect()
    const dx = m.x - (r.left + r.width / 2), dy = m.y - (r.top + r.height / 3)
    skew = Math.max(-6, Math.min(6, -dx / 120))
    fx = Math.max(-12, Math.min(12, dx / 22)); fy = Math.max(-8, Math.min(8, dy / 32))
  }
  return (
    <div ref={ref} className="absolute bottom-0 transition-all duration-500 ease-in-out" style={{ left, width, height, backgroundColor: color, borderRadius: "12px 12px 0 0", transform: `skewX(${skew}deg)`, transformOrigin: "bottom center" }}>
      <div className="absolute flex gap-5 transition-all duration-300" style={{ left: width / 2 - 26 + fx, top: faceTop + fy }}>
        <EyeBall blink={blink} cover={cover} /><EyeBall blink={blink} cover={cover} />
      </div>
    </div>
  )
}

function useBlink() {
  const [b, setB] = useState(false)
  useEffect(() => {
    let t: any
    const loop = () => { t = setTimeout(() => { setB(true); setTimeout(() => { setB(false); loop() }, 150) }, Math.random() * 4000 + 3000) }
    loop(); return () => clearTimeout(t)
  }, [])
  return b
}

const PERKS = [
  "7 dias grátis com acesso Pro — sem cartão",
  "Tutores, pets e agenda num só painel",
  "Prontuário eletrônico e histórico do pet",
  "Lembretes de consulta e financeiro",
]

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [clinic, setClinic] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const blinkA = useBlink(), blinkB = useBlink()
  const coverEyes = password.length > 0 && !showPass

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    const { error } = mode === "login" ? await signIn(email, password) : await signUp(email, password, name, clinic)
    setLoading(false)
    if (error) { setError(error.message?.includes("Invalid login") ? "E-mail ou senha incorretos." : (error.message || "Falha na autenticação.")); return }
    router.push("/app")
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#060d17] text-white">
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-sky-500/90 via-sky-600 to-[#04263b]">
        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold text-white">
          <div className="size-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center"><PawPrint className="size-5" /></div>
          <span>VetFlow</span>
        </div>
        <div className="relative z-20 flex items-end justify-center h-[440px]">
          <div className="relative" style={{ width: 480, height: 400 }}>
            <Character color="#0c4a6e" left={20} width={160} height={360} blink={blinkB} faceTop={50} />
            <Character color="#0ea5e9" left={200} width={190} height={400} blink={blinkA} cover={coverEyes} faceTop={48} />
          </div>
        </div>
        <div className="relative z-20 text-white/90 max-w-md">
          <h2 className="text-2xl font-bold text-white">A gestão da sua clínica, sem complicação.</h2>
          <ul className="mt-4 space-y-2">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/85"><Check className="size-4 mt-0.5 shrink-0 text-white" /> {p}</li>
            ))}
          </ul>
        </div>
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-300/25 blur-3xl" />
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 text-white font-semibold mb-8"><PawPrint className="size-6 text-brand-light" /> VetFlow</div>
          <h1 className="text-2xl font-semibold text-white">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
          <p className="text-sm text-slate-500 mt-1">{mode === "login" ? "Acesse o painel da sua clínica." : "Comece com 7 dias grátis no nível Pro."}</p>

          <div className="mt-6 grid grid-cols-2 gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null) }} className={`py-2 rounded-md text-sm font-medium transition ${mode === m ? "bg-brand text-white" : "text-slate-400 hover:text-white"}`}>
                {m === "login" ? "Login" : "Registro"}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === "signup" && (<>
              <Field icon={<User className="size-4" />}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm" />
              </Field>
              <Field icon={<Building2 className="size-4" />}>
                <input value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Nome da clínica" className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm" />
              </Field>
            </>)}
            <Field icon={<Mail className="size-4" />}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required autoComplete="email" className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm" />
            </Field>
            <Field icon={<Lock className="size-4" />}>
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} className="w-full bg-transparent outline-none text-white placeholder-slate-500 text-sm" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-500 hover:text-white">{showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </Field>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta grátis"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">Ao continuar você concorda com os termos. <Link href="/" className="text-brand-light hover:underline">Voltar ao site</Link></p>
        </div>
      </div>
    </div>
  )
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus-within:border-brand/50 transition">
      <span className="text-slate-500">{icon}</span>{children}
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#060d17] grid place-items-center"><Loader2 className="size-6 text-brand animate-spin" /></div>}><LoginInner /></Suspense>
}
