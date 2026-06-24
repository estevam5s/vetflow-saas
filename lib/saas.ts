import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase"

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
export const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase())

export const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function siteUrl() {
  return (process.env.APP_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")
}

export async function getUserFromRequest(req: Request) {
  const authz = req.headers.get("authorization") || ""
  if (!authz.startsWith("Bearer ")) return null
  const { data } = await createAdminClient().auth.getUser(authz.slice(7))
  return data?.user ?? null
}

export async function getAccessForUser(userId: string, email?: string | null) {
  const db = createAdminClient()
  const [{ data: sub }, { data: profile }, { data: plans }] = await Promise.all([
    db.from("app_subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    db.from("profiles").select("trial_ends_at").eq("id", userId).maybeSingle(),
    db.from("app_plans").select("*").eq("active", true).order("sort_order"),
  ])
  const admin = isAdminEmail(email)
  const trialEndsAt = profile?.trial_ends_at ?? null
  const trialActive = !!trialEndsAt && new Date(trialEndsAt) > new Date()
  const paidActive = !!sub && sub.plan_slug !== "inicial" && ["active", "trialing"].includes(sub.status)
  const realSlug = admin ? "enterprise" : (sub?.plan_slug || "inicial")
  const plan = (plans || []).find((p) => p.slug === realSlug) || null
  const effectiveSlug = admin ? "enterprise" : paidActive ? sub!.plan_slug : trialActive ? "pro" : realSlug
  const effPlan = (plans || []).find((p) => p.slug === effectiveSlug) || null
  const hasAccess = admin || paidActive || trialActive
  return {
    userId, email: email ?? null, isAdmin: admin, subscription: sub ?? null, plan, plans: plans || [],
    trialActive, trialEndsAt, hasAccess, limits: effPlan?.limits ?? {},
  }
}

const STRIPE_BASE = "https://api.stripe.com/v1"
function toForm(obj: Record<string, any>, prefix = ""): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === "object" && !Array.isArray(v)) parts.push(toForm(v, key))
    else if (Array.isArray(v)) v.forEach((it, i) => parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(it)}`))
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
  }
  return parts.filter(Boolean).join("&")
}
export async function stripeReq(path: string, body?: Record<string, any>, method = "POST") {
  const res = await fetch(`${STRIPE_BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? toForm(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || "Stripe error")
  return json
}

export function verifyStripeSignature(payload: string, sigHeader: string | null, secret: string): boolean {
  if (!sigHeader) return false
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")))
  const t = parts["t"], v1 = parts["v1"]
  if (!t || !v1) return false
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex")
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)) } catch { return false }
}
