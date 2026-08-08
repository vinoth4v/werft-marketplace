import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { formatRelative, formatUtc } from "@/lib/time"
import { getAppByName } from "@/registry/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const app = await getAppByName(name)
  return { title: app?.title ?? name }
}

const STATUS_LABEL: Record<string, string> = {
  prototype: "Prototype — early, may change a lot",
  active: "Active — in regular use",
  paused: "Paused — not being worked on right now",
  archived: "Archived — no longer maintained",
}

const HEALTH_LABEL: Record<string, string> = {
  healthy: "Online — responded to the last check",
  unhealthy: "Not responding — the last check failed",
  unknown: "Not checked yet — checks run nightly, so a new app can sit here for up to a day",
}

function healthLabel(health: string): string {
  return HEALTH_LABEL[health] ?? `Unrecognised state: ${health}`
}

export default async function AppDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const app = await getAppByName(name)
  if (!app) notFound()

  const deployedAt = new Date(app.lastDeployAt)

  return (
    <main className="wide">
      <Link href="/" className="back-link">
        ← All apps
      </Link>

      <div className="detail-header">
        <h1>{app.title ?? app.name}</h1>
        <span className={`health-dot health-${app.health}`} title={healthLabel(app.health)}>
          <span className="sr-only">{healthLabel(app.health)}</span>
        </span>
      </div>

      {app.title && <p className="slug">{app.name}</p>}

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
          <dd>
            {healthLabel(app.health)}
            {app.healthCheckedAt && (
              <span className="field-hint">
                {" "}
                — checked {formatRelative(new Date(app.healthCheckedAt))}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Visibility</dt>
          <dd>
            {app.private
              ? "Private — repository is not public"
              : "Public — anyone can see the repository"}
          </dd>
        </div>
        <div>
          <dt>Last deployed</dt>
          <dd>
            {formatRelative(deployedAt)}
            <span className="field-hint"> ({formatUtc(deployedAt)})</span>
          </dd>
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
            <dt>Categories</dt>
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

      <section className="help-box">
        <h2>Working on this app</h2>
        <ul>
          <li>
            Ship a change: open a PR in{" "}
            <a href={app.repoUrl} target="_blank" rel="noreferrer">
              the repo
            </a>{" "}
            — the gates run against a real preview on its own database branch, and this card updates
            itself when the PR merges.
          </li>
          <li>
            Delegate it: comment <code>@claude</code> on an issue there and review the branch that
            comes back.
          </li>
        </ul>
      </section>
    </main>
  )
}
