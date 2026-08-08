import { signOutAction } from "@/app/actions"
import { AppGrid } from "@/app/app-grid"
import { auth } from "@/auth"
import { allTags, listApps } from "@/registry/queries"

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
          <p className="subtitle">Every app you've scaffolded from werft-template, in one place.</p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="secondary-button">
            Sign out
          </button>
        </form>
      </div>

      <AppGrid apps={apps} tags={tags} />

      <p className="signed-in-as">Signed in as {session?.user?.email ?? "unknown"}.</p>
    </main>
  )
}
