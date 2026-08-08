import Link from "next/link"
import { notFound } from "next/navigation"
import { getAppByName } from "@/registry/queries"

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  prototype: "Prototype — early, may change a lot",
  active: "Active — in regular use",
  paused: "Paused — not being worked on right now",
  archived: "Archived — no longer maintained",
}

const HEALTH_LABEL: Record<string, string> = {
  healthy: "Online — responded to the last check",
  unhealthy: "Not responding — the last check failed",
  unknown: "Not checked yet",
}

export default async function AppDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const app = await getAppByName(name)
  if (!app) notFound()

  return (
    <main className="wide">
      <Link href="/" className="back-link">
        ← All apps
      </Link>

      <div className="detail-header">
        <h1>{app.name}</h1>
        <span className={`health-dot health-${app.health}`} title={HEALTH_LABEL[app.health]} />
      </div>

      <p className="subtitle">{app.description}</p>

      <div className="detail-actions">
        {app.url ? (
          <a href={app.url} target="_blank" rel="noreferrer" className="launch-button">
            Open app ↗
          </a>
        ) : (
          <span className="launch-button launch-button-disabled">Not deployed yet</span>
        )}
        <a href={app.repoUrl} target="_blank" rel="noreferrer" className="secondary-button">
          View repo ↗
        </a>
      </div>

      <dl className="detail-fields">
        <div>
          <dt>Status</dt>
          <dd>{STATUS_LABEL[app.status] ?? app.status}</dd>
        </div>
        <div>
          <dt>Health</dt>
          <dd>{HEALTH_LABEL[app.health]}</dd>
        </div>
        <div>
          <dt>Visibility</dt>
          <dd>{app.private ? "Private" : "Public"}</dd>
        </div>
        <div>
          <dt>Last deployed</dt>
          <dd>{new Date(app.lastDeployAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>
            <div className="badges">
              {app.stack.map((tech) => (
                <span key={tech} className="badge">
                  {tech}
                </span>
              ))}
            </div>
          </dd>
        </div>
        {app.tags.length > 0 && (
          <div>
            <dt>Tags</dt>
            <dd>
              <div className="badges">
                {app.tags.map((tag) => (
                  <span key={tag} className="badge badge-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </dd>
          </div>
        )}
      </dl>
    </main>
  )
}
