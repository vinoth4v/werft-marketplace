import type { Metadata } from "next"
import Link from "next/link"
import { signOutAction } from "@/app/actions"
import { AppGrid } from "@/app/app-grid"
import { auth } from "@/auth"
import { formatRelative } from "@/lib/time"
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

  const online = apps.filter((app) => app.health === "healthy").length
  const down = apps.filter((app) => app.health === "unhealthy")
  const unchecked = apps.filter((app) => app.health === "unknown").length
  // The newest check timestamp across the fleet — one nightly run stamps them
  // all, so this is "when the fleet was last looked at".
  const lastChecked = apps
    .map((app) => app.healthCheckedAt)
    .filter((at): at is Date => at !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  return (
    <main className="wide">
      <div className="page-header">
        <div>
          <h1>Your apps</h1>
          <p className="subtitle">
            Everything you've shipped, with a pulse. Click a card for details;{" "}
            <span className="health-dot health-healthy inline-dot" aria-hidden="true" /> means it
            answered the most recent health check.
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

      {apps.length > 0 && (
        <section className="stat-strip" aria-label="Fleet overview">
          <div className="stat-tile">
            <span className="stat-value">{apps.length}</span>
            <span className="stat-label">apps</span>
          </div>
          <div className="stat-tile">
            <span className="stat-value">{online}</span>
            <span className="stat-label">
              <span className="health-dot health-healthy inline-dot" aria-hidden="true" /> online
            </span>
          </div>
          <div className="stat-tile">
            <span className="stat-value">{down.length}</span>
            <span className="stat-label">
              <span className="health-dot health-unhealthy inline-dot" aria-hidden="true" /> not
              responding
            </span>
          </div>
          {unchecked > 0 && (
            <div className="stat-tile">
              <span className="stat-value">{unchecked}</span>
              <span className="stat-label">awaiting first check</span>
            </div>
          )}
          {lastChecked && <p className="stat-checked">checked {formatRelative(lastChecked)}</p>}
        </section>
      )}

      {down.length > 0 && (
        <div className="attention" role="alert">
          <strong>Needs attention:</strong>{" "}
          {down.map((app, index) => (
            <span key={app.id}>
              {index > 0 && ", "}
              <Link href={`/apps/${app.name}`}>{app.title ?? app.name}</Link>
            </span>
          ))}{" "}
          — {down.length === 1 ? "it" : "they"} failed the last health check.
        </div>
      )}

      <AppGrid apps={apps} tags={tags} />

      <p className="signed-in-as">Signed in as {session?.user?.email ?? "unknown"}.</p>
    </main>
  )
}
