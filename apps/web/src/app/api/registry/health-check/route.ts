import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { werftApp } from "@/db/schema"

// Vercel Cron requests time out its own functions well before this, but a
// slow app under test must not be allowed to stall every other app's check.
const PER_APP_TIMEOUT_MS = 8000

/**
 * Nightly, via vercel.json's crons entry. Vercel signs cron requests with
 * CRON_SECRET automatically — this route only has to check for it, never
 * generate or store it itself.
 *
 * Fails closed: a missing CRON_SECRET rejects the request rather than
 * skipping the check. This matches Vercel's own documented pattern —
 * `!cronSecret || header !== ...` — the opposite of what shipped first,
 * which treated an unconfigured secret as "no check needed" and left this
 * open to the internet until it was tested against the real deployment.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const apps = await db().select().from(werftApp)
  const checkedAt = new Date()

  const results = await Promise.all(
    apps.map(async (app) => {
      const health = app.url ? await ping(app.url) : "unknown"
      await db()
        .update(werftApp)
        .set({ health, healthCheckedAt: checkedAt })
        .where(eq(werftApp.id, app.id))
      return { name: app.name, health }
    }),
  )

  return NextResponse.json({ checkedAt, results })
}

async function ping(url: string): Promise<"healthy" | "unhealthy"> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PER_APP_TIMEOUT_MS)
  try {
    // HEAD first — cheaper, and enough to know the app answers. Some apps
    // (this template's own gate, for one) reject HEAD, so a non-2xx/3xx
    // falls back to a real GET before being called unhealthy.
    const head = await fetch(url, { method: "HEAD", signal: controller.signal })
    if (head.ok || (head.status >= 300 && head.status < 400)) return "healthy"

    const get = await fetch(url, { method: "GET", signal: controller.signal })
    return get.ok || (get.status >= 300 && get.status < 400) ? "healthy" : "unhealthy"
  } catch {
    return "unhealthy"
  } finally {
    clearTimeout(timeout)
  }
}
