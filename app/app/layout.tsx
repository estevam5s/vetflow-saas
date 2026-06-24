"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { PawPrint, LayoutDashboard, Users, Calendar, CreditCard, Shield, LogOut, Home, Dog } from "lucide-react"

const NAV = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/app/owners", label: "Tutores", icon: Users },
  { href: "/app/pets", label: "Pets", icon: Dog },
  { href: "/app/appointments", label: "Agenda", icon: Calendar },
  { href: "/app/billing", label: "Assinatura", icon: CreditCard },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, isAdmin, sub } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { if (!loading && !user) router.replace("/login") }, [loading, user, router])

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center bg-[#060d17]"><div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" /></div>
  }

  const planName = isAdmin ? "Admin" : sub?.plan?.name || "Inicial"

  return (
    <div className="min-h-screen bg-[#060d17] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-white/5 bg-[#0a1422]/80 backdrop-blur p-5">
        <Link href="/app" className="flex items-center gap-2 mb-8 text-white font-bold">
          <div className="size-8 rounded-lg bg-brand grid place-items-center"><PawPrint className="size-5 text-white" /></div>
          VetFlow
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname === n.href || pathname.startsWith(n.href + "/")
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-brand/10 text-brand-light font-medium" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <n.icon className="size-5" /> {n.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link href="/app/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${pathname.startsWith("/app/admin") ? "bg-brand/10 text-brand-light" : "text-amber-400/80 hover:text-amber-300 hover:bg-white/5"}`}>
              <Shield className="size-5" /> Painel admin
            </Link>
          )}
        </nav>
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="px-3 mb-3">
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-brand/15 text-brand-light">{planName}{!isAdmin && sub?.trial_active ? " · Teste Pro" : ""}</span>
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5"><Home className="size-4" /> Site</Link>
          <button onClick={async () => { await signOut() }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-white/5"><LogOut className="size-4" /> Sair</button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0a1422]">
          <Link href="/app" className="text-white font-bold flex items-center gap-2"><PawPrint className="size-5 text-brand-light" /> VetFlow</Link>
          <button onClick={async () => { await signOut() }} className="text-sm text-red-400">Sair</button>
        </div>
        <div className="lg:hidden flex gap-1 p-2 overflow-x-auto border-b border-white/5 bg-[#0a1422]">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs ${pathname === n.href ? "bg-brand/10 text-brand-light" : "text-slate-400"}`}>{n.label}</Link>
          ))}
        </div>
        <div className="p-5 sm:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
