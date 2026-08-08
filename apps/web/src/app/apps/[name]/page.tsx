import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MODEL_LABELS, MODELS } from "@/lib/models"
import { formatRelative, formatUtc } from "@/lib/time"
import { getAppByName } from "@/registry/queries"
import { requestFeatureAction, retireAppAction } from "./actions.ts"

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

export default async function AppDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>
  searchParams: Promise<{ error?: string; requested?: string; retiring?: string }>
}) {
  const { name } = await params
  const banner = await searchParams
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

      {banner.error && (
        <p className="banner banner-error" role="alert">
          {banner.error}
        </p>
      )}
      {banner.requested && (
        <p className="banner banner-ok" role="status">
          Claude has it. An issue was filed in the repo and it will open a pull request — the five
          gates run before anything reaches production, and you merge.
        </p>
      )}
      {banner.retiring && (
        <p className="banner banner-ok" role="status">
          Retiring {app.title ?? app.name}. You will get an issue in werft-template saying what was
          removed, and what survived if anything did.
        </p>
      )}

      <section className="help-box">
        <h2>Ask for a change</h2>
        <p className="field-hint">
          Describe it the way you would say it out loud. It becomes an <code>@claude</code> issue in
          this app's own repo, so Claude reads the existing code, writes the change — a database
          migration too, if it needs one — and opens a pull request. The app's five gates run
          against a real preview on its own database branch. You merge; nothing reaches production
          on its own.
        </p>
        <form action={requestFeatureAction} className="scaffold-form">
          <input type="hidden" name="app_name" value={app.name} />
          <div className="form-field">
            <label htmlFor="title">Title (optional)</label>
            <input id="title" name="title" maxLength={80} placeholder="Add a CSV export" />
          </div>
          <div className="form-field">
            <label htmlFor="model">Model</label>
            <select id="model" name="model" defaultValue="">
              {MODELS.map((model) => (
                <option key={model} value={model}>
                  {MODEL_LABELS[model]}
                </option>
              ))}
            </select>
            <p className="field-hint">
              Match it to the work: a rename does not need what a new feature needs, and the
              subscription's window is finite.
            </p>
          </div>
          <div className="form-field">
            <label htmlFor="request">What should change?</label>
            <textarea
              id="request"
              name="request"
              rows={8}
              maxLength={20_000}
              required
              placeholder={
                "Add a button on the dashboard that exports the current table as CSV.\n\nKeep it behind the existing login. No new dependencies."
              }
            />
          </div>
          <button type="submit">Send to Claude</button>
        </form>
      </section>

      <section className="help-box">
        <h2>Other ways in</h2>
        <ul>
          <li>
            By hand: open a PR in{" "}
            <a href={app.repoUrl} target="_blank" rel="noreferrer">
              the repo
            </a>{" "}
            — the gates run against a real preview on its own database branch, and this card updates
            itself when the PR merges.
          </li>
          <li>
            From GitHub: comment <code>@claude</code> on any issue or PR there, which is the same
            mechanism the box above uses.
          </li>
        </ul>
      </section>

      {app.name !== "werft-template" && app.name !== "werft-marketplace" && (
        <section className="help-box danger-box">
          <h2>Retire this app</h2>
          <p className="field-hint">
            Removes the Vercel project, the Neon database and everything in it, any S3 bucket and
            its scoped AWS user, and this card. <strong>None of it can be undone.</strong> The
            GitHub repository is kept unless you tick the box, so the code survives by default.
          </p>
          <form action={retireAppAction} className="scaffold-form">
            <input type="hidden" name="app_name" value={app.name} />
            <div className="form-field">
              <label htmlFor="confirm">
                Type <code>{app.name}</code> to confirm
              </label>
              <input
                id="confirm"
                name="confirm"
                required
                autoComplete="off"
                pattern={app.name}
                title={`Type ${app.name} exactly`}
                placeholder={app.name}
              />
            </div>
            <label className="check">
              <input type="checkbox" name="delete_repo" /> Also delete the GitHub repository
              <span className="field-hint"> — the code is unrecoverable</span>
            </label>
            <button type="submit" className="danger-button">
              Retire {app.title ?? app.name}
            </button>
          </form>
        </section>
      )}
    </main>
  )
}
