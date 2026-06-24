import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest, isAdminEmail } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const db = createAdminClient()
  const view = new URL(req.url).searchParams.get("view") || "overview"

  if (view === "users") {
    const [{ data: profiles }, { data: subs }] = await Promise.all([
      db.from("profiles").select("id,email,full_name,clinic_name,trial_ends_at,plan_slug,created_at").order("created_at", { ascending: false }).limit(500),
      db.from("app_subscriptions").select("*"),
    ])
    const byUser = new Map((subs || []).map((s) => [s.user_id, s]))
    const users = (profiles || []).map((p) => ({ ...p, subscription: byUser.get(p.id) || null }))
    return NextResponse.json({ users })
  }

  const [profiles, paid, events, pets, appts] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("app_subscriptions").select("plan_slug", { count: "exact" }).neq("plan_slug", "inicial").in("status", ["active", "trialing"]),
    db.from("app_payment_events").select("id", { count: "exact", head: true }),
    db.from("pets").select("id", { count: "exact", head: true }),
    db.from("appointments").select("id", { count: "exact", head: true }),
  ])
  const { data: planRows } = await db.from("app_subscriptions").select("plan_slug").neq("plan_slug", "inicial").in("status", ["active", "trialing"])
  const byPlan: Record<string, number> = {}
  for (const s of planRows || []) byPlan[s.plan_slug] = (byPlan[s.plan_slug] || 0) + 1
  return NextResponse.json({
    totals: { users: profiles.count || 0, paid: paid.count || 0, events: events.count || 0, pets: pets.count || 0, appointments: appts.count || 0 },
    byPlan,
  })
}
