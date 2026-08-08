import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db/client"
import { werftApp } from "@/db/schema"

/**
 * Removes an app from the registry — the other half of upsert, without which
 * a deleted app's row lives forever with a red health dot.
 *
 * Same bearer token as upsert: the callers are the same trusted automation
 * (an app's teardown, or the operator by hand), and the registry's whole
 * write surface stays behind one credential.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
): Promise<NextResponse> {
  const expected = process.env.WERFT_REGISTRY_TOKEN
  if (!expected) {
    return NextResponse.json({ error: "registry is not configured" }, { status: 500 })
  }

  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { name } = await params
  const removed = await db().delete(werftApp).where(eq(werftApp.name, name)).returning()

  if (removed.length === 0) {
    return NextResponse.json({ error: `no app named "${name}" in the registry` }, { status: 404 })
  }

  return NextResponse.json({ ok: true, removed: name })
}
