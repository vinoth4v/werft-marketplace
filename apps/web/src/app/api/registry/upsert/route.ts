import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { werftApp } from "@/db/schema"
import { repoUrlFor, werftAppPayloadSchema } from "@/registry/werft-app"

/**
 * Called by every app's CI on merge to main, with that app's own werft.json.
 *
 * Read locally, not via env(): this route is the only thing that needs
 * WERFT_REGISTRY_TOKEN, and env() is strict-and-global — making it required
 * there would break sign-in on any deploy that didn't happen to set it.
 *
 * A bearer token, not a raw database credential: every app repo's CI calls
 * this over HTTP, so none of them ever hold write access to this database
 * directly, and this endpoint validates what it accepts instead of trusting
 * an arbitrary insert.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.WERFT_REGISTRY_TOKEN
  if (!expected) {
    return NextResponse.json({ error: "registry upsert is not configured" }, { status: 500 })
  }

  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => null)
  const parsed = werftAppPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid payload", issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const app = parsed.data
  const [row] = await db()
    .insert(werftApp)
    .values({
      name: app.name,
      description: app.description,
      stack: app.stack,
      url: app.url,
      tags: app.tags,
      status: app.status,
      private: app.private,
      repoUrl: repoUrlFor(app.name),
      lastDeployAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: werftApp.name,
      set: {
        description: app.description,
        stack: app.stack,
        url: app.url,
        tags: app.tags,
        status: app.status,
        private: app.private,
        repoUrl: repoUrlFor(app.name),
        lastDeployAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning()

  return NextResponse.json({ ok: true, app: row })
}
