import type { Metadata } from "next"
import Link from "next/link"
import { CopyButton } from "@/app/copy-button"
import { MODEL_LABELS, MODELS } from "@/lib/models"
import { scaffoldAction } from "./actions.ts"
import { BuildPlanField } from "./build-plan-field.tsx"
import { ThemePicker } from "./theme-picker.tsx"

export const metadata: Metadata = {
  title: "New app",
}

export const dynamic = "force-dynamic"

const SCAFFOLD_COMMAND = `export NEON_API_KEY="$(cat ~/.config/werft/neon-key)"
cd ~/Documents/workspace/werft-template
pnpm create-app \\
  --name my-app \\
  --description "One line for the card on this page." \\
  --dir ~/Documents/workspace/my-app \\
  --email you@example.com \\
  --password 'at least 12 characters' \\
  --tags personal \\
  --public \\
  --yes`

export default async function NewAppPage({
  searchParams,
}: {
  searchParams: Promise<{ dispatched?: string; error?: string }>
}) {
  const { dispatched, error } = await searchParams

  return (
    <main className="wide">
      <Link href="/" className="back-link">
        ← All apps
      </Link>

      <h1>Create a new app</h1>
      <p className="subtitle">
        Fill this in and a deployed, authenticated app with its own database, CI gates and preview
        pipeline builds itself — then appears on this page on its own.
      </p>

      {dispatched && (
        <div className="banner banner-ok" role="status">
          <strong>{dispatched}</strong> is being built.{" "}
          <a
            href="https://github.com/vinoth4v/werft-template/actions/workflows/scaffold-app.yml"
            target="_blank"
            rel="noreferrer"
          >
            Watch the run ↗
          </a>{" "}
          — it takes about two minutes, then the app's card appears on{" "}
          <Link href="/">the home page</Link>. Sign-in isn't configured yet: run{" "}
          <code>pnpm hash-password</code> in the new repo when you're ready.
        </div>
      )}
      {error && (
        <div className="banner banner-error" role="alert">
          That didn't dispatch: {error}
        </div>
      )}

      <form action={scaffoldAction} className="scaffold-form">
        <div className="form-field">
          <label htmlFor="app_name">Name</label>
          <input
            id="app_name"
            name="app_name"
            required
            pattern="[a-z][a-z0-9-]{0,38}[a-z0-9]"
            placeholder="my-app"
            title="Lowercase letters, digits and hyphens; 2–40 characters"
          />
          <p className="field-hint">
            Becomes the GitHub repo, the database, the Vercel project and the URL (name.vercel.app)
            — choose like it's permanent.
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="title">Display name</label>
          <input id="title" name="title" maxLength={60} placeholder="My App" />
          <p className="field-hint">
            Optional. How it's shown on this page — capitals and spaces allowed, unlike the name
            above. Leave blank to just use the name.
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            name="description"
            required
            placeholder="One line for the card on this page."
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Operator email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" />
          <p className="field-hint">The only address that will be able to sign in to the app.</p>
        </div>

        <div className="form-field">
          <label htmlFor="tags">Tags</label>
          <input id="tags" name="tags" placeholder="personal, tools (comma-separated, optional)" />
        </div>

        <ThemePicker name="theme" />

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="visibility">Repository</label>
            <select id="visibility" name="visibility" defaultValue="public">
              <option value="public">Public — required checks enforced for free</option>
              <option value="private">Private — checks advisory on the Free plan</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="prototype">
              <option value="prototype">Prototype</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="region">Region</label>
          <select id="region" name="region" defaultValue="">
            <option value="">Provider default (fastest to provision)</option>
            <option value="us-east">US East — database, functions and bucket together</option>
            <option value="eu-central">Europe (Frankfurt) — all three together</option>
            <option value="us-west">US West — all three together</option>
          </select>
          <p className="field-hint">
            One choice co-locates the database, the functions and (if enabled) the S3 bucket.
          </p>
        </div>

        <div className="form-checks">
          <label className="check">
            <input type="checkbox" name="deploy" defaultChecked /> Deploy to production at the end
          </label>
          <label className="check">
            <input type="checkbox" name="with_s3" /> Provision an S3 bucket
            <span className="field-hint">
              {" "}
              — Werft mints a bucket and a key scoped to only that bucket; you never touch the AWS
              console
            </span>
          </label>
          <label className="check">
            <input type="checkbox" name="vercel_sso" /> Put Vercel SSO in front of the whole
            deployment <span className="field-hint">(breaks preview URLs — rarely wanted)</span>
          </label>
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
            A long plan earns the strongest model; a small one does not. Only used if you give a
            build plan below.
          </p>
        </div>

        <BuildPlanField name="build_plan" />

        <button type="submit" className="launch-button form-submit">
          Create app
        </button>
        <p className="field-hint">
          No password field on purpose: workflow inputs are visible in the public run log. The new
          app gets your standing operator password, so you can sign in as soon as it is live.
        </p>
      </form>

      <details className="cli-details">
        <summary>Prefer the terminal?</summary>
        <p className="field-hint">
          Same scaffold, run locally — and the only way to set the password in the same step:
        </p>
        <div className="command-block">
          <pre>{SCAFFOLD_COMMAND}</pre>
          <CopyButton text={SCAFFOLD_COMMAND} />
        </div>
      </details>

      <section className="help-box">
        <h2>Working on an app after that</h2>
        <ul>
          <li>
            <strong>Every change goes through a PR</strong> — <code>main</code> is protected, merges
            are blocked until the checks pass, and that includes you.
          </li>
          <li>
            <strong>
              Comment <code>@claude</code>
            </strong>{" "}
            on any issue or PR in the app's repo and Claude Code implements it headlessly, pushing a
            branch for you to review.
          </li>
          <li>
            <strong>Gates stay red?</strong> Run the app repo's <em>Claude Code — escalate</em>{" "}
            workflow from its Actions tab to retry with a stronger model.
          </li>
          <li>
            <strong>Retiring an app?</strong> Delete its repo, Neon and Vercel projects, then remove
            its card: <code>DELETE /api/registry/apps/&lt;name&gt;</code> with the registry token.
          </li>
        </ul>
      </section>
    </main>
  )
}
