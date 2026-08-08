import { NextResponse } from "next/server"
import { listApps } from "@/registry/queries"

/**
 * The fleet, for automation that has to act on every app at once.
 *
 * The wall itself reads the database directly; this exists for callers with no
 * database access and no browser session — rotating the operator password
 * across every delivered app, for one. They need the list of names and URLs,
 * and nothing else here can give it to them: every page is behind the
 * single-operator session, so an unauthenticated fetch of "/" returns the login
 * page rather than data.
 *
 * Same bearer token as upsert and delete, so the registry's whole automation
 * surface stays behind one credential. Deliberately not the session: a token is
 * what a script can hold.
 *
 * Returns only what a fleet operation needs — name, title, url, status. Not the
 * whole row: health timestamps and ids are the wall's business, and an endpoint
 * that returns everything invites callers to depend on everything.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const expected = process.env.WERFT_REGISTRY_TOKEN
  if (!expected) {
    return NextResponse.json({ error: "registry is not configured" }, { status: 500 })
  }

  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const apps = await listApps()
  return NextResponse.json({
    apps: apps.map((app) => ({
      name: app.name,
      title: app.title,
      url: app.url,
      status: app.status,
    })),
  })
}
