import type { Metadata } from "next"
import Link from "next/link"
import { signOutAction } from "@/app/actions"
import { AppGrid } from "@/app/app-grid"
import { auth } from "@/auth"
import { allTags, listApps } from "@/registry/queries"

export const metadata: Metadata = {
  title: "Your apps",
}

// Reads the session cookie and the database on every load, so there is
// nothing here that can be prerendered.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [session, apps] = await Promise.all([auth(), listApps()])
  const tags = allTags(apps)

  return (
    <main className="wide">
      <div className="page-header">
        <div>
          <h1>Your apps</h1>
          <p className="subtitle">
            Everything you've shipped, with a pulse. Click a card for details, or{" "}
            <span className="health-dot health-healthy inline-dot" aria-hidden="true" /> means it
            answered last night's health check.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/new" className="launch-button">
            + New app
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="secondary-button">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <AppGrid apps={apps} tags={tags} />

      <p className="signed-in-as">Signed in as {session?.user?.email ?? "unknown"}.</p>
    </main>
  )
}
