import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest, getAccessForUser } from "@/lib/saas"

export const dynamic = "force-dynamic"

const TABLES = ["owners", "pets", "appointments"] as const
type Table = (typeof TABLES)[number]

function table(req: Request): Table | null {
  const t = new URL(req.url).searchParams.get("type") as Table
  return TABLES.includes(t) ? t : null
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const t = table(req)
  if (!t) return NextResponse.json({ error: "type inválido" }, { status: 400 })
  const db = createAdminClient()
  let q = db.from(t).select("*").eq("user_id", user.id)
  if (t === "appointments") q = q.order("scheduled_at", { ascending: true })
  else q = q.order("created_at", { ascending: false })
  const { data } = await q.limit(500)
  // junta nomes p/ pets/appointments
  if (t === "pets") {
    const { data: owners } = await db.from("owners").select("id,name").eq("user_id", user.id)
    const map = new Map((owners || []).map((o) => [o.id, o.name]))
    return NextResponse.json({ items: (data || []).map((p) => ({ ...p, owner_name: map.get(p.owner_id) || null })) })
  }
  if (t === "appointments") {
    const { data: pets } = await db.from("pets").select("id,name").eq("user_id", user.id)
    const map = new Map((pets || []).map((p) => [p.id, p.name]))
    return NextResponse.json({ items: (data || []).map((a) => ({ ...a, pet_name: map.get(a.pet_id) || null })) })
  }
  return NextResponse.json({ items: data || [] })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const t = table(req)
  if (!t) return NextResponse.json({ error: "type inválido" }, { status: 400 })
  const acc = await getAccessForUser(user.id, user.email)
  if (!acc.hasAccess) return NextResponse.json({ error: "Assine um plano ou ative o teste para cadastrar.", code: "NO_ACCESS" }, { status: 402 })
  const db = createAdminClient()
  const b = await req.json().catch(() => ({}))

  // gating: limite de pets do plano
  if (t === "pets") {
    const limit = (acc.limits as any)?.pets ?? 50
    if (limit !== -1) {
      const { count } = await db.from("pets").select("id", { count: "exact", head: true }).eq("user_id", user.id)
      if ((count || 0) >= limit) return NextResponse.json({ error: `Limite de pets do plano atingido (${limit}). Faça upgrade.`, code: "LIMIT_PETS" }, { status: 402 })
    }
  }

  const fieldsByTable: Record<Table, string[]> = {
    owners: ["name", "email", "phone", "cpf", "address", "notes"],
    pets: ["owner_id", "name", "species", "breed", "sex", "birth_date", "weight", "notes"],
    appointments: ["pet_id", "scheduled_at", "status", "reason", "notes"],
  }
  const row: any = { user_id: user.id }
  for (const f of fieldsByTable[t]) if (b[f] !== undefined && b[f] !== "") row[f] = b[f]
  if (!row.name && t !== "appointments") return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
  if (t === "appointments" && !row.scheduled_at) return NextResponse.json({ error: "Data obrigatória" }, { status: 400 })

  const { data, error } = await db.from(t).insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ item: data })
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const t = table(req)
  if (!t) return NextResponse.json({ error: "type inválido" }, { status: 400 })
  const b = await req.json().catch(() => ({}))
  if (!b.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const patch: any = { updated_at: new Date().toISOString() }
  const allowed = ["name", "email", "phone", "cpf", "address", "notes", "owner_id", "species", "breed", "sex", "birth_date", "weight", "pet_id", "scheduled_at", "status", "reason"]
  for (const f of allowed) if (f in b) patch[f] = b[f]
  const { data, error } = await db.from(t).update(patch).eq("id", b.id).eq("user_id", user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ item: data })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const t = table(req)
  if (!t) return NextResponse.json({ error: "type inválido" }, { status: 400 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const { error } = await createAdminClient().from(t).delete().eq("id", id).eq("user_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
