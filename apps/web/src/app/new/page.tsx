import type { Metadata } from "next"
import Link from "next/link"
import { CopyButton } from "@/app/copy-button"

export const metadata: Metadata = {
  title: "New app",
}

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

export default function NewAppPage() {
  return (
    <main>
      <Link href="/" className="back-link">
        ← All apps
      </Link>

      <h1>Scaffold a new app</h1>
      <p className="subtitle">
        One command gives you a deployed, authenticated app with its own database, CI gates, and
        preview pipeline — and it appears on this page by itself.
      </p>

      <ol className="steps">
        <li>
          <h2>Run the scaffold</h2>
          <p>
            From your machine, with the <code>gh</code> and <code>vercel</code> CLIs signed in.
            Change <code>--name</code>, the description, email and password; the name becomes the
            GitHub repo, the database, the Vercel project and the URL.
          </p>
          <div className="command-block">
            <pre>{SCAFFOLD_COMMAND}</pre>
            <CopyButton text={SCAFFOLD_COMMAND} />
          </div>
        </li>
        <li>
          <h2>Wait about two minutes</h2>
          <p>
            The scaffold builds the app locally first, so the common failure costs nothing to clean
            up — then creates the repo, database and hosting, deploys, sets the CI secrets, and
            protects <code>main</code>. If anything fails midway, it removes what it created or
            prints the exact cleanup command for whatever it could not.
          </p>
        </li>
        <li>
          <h2>There is no step three</h2>
          <p>
            The app registers itself on this page during the scaffold's own final push, and every
            merge to <code>main</code> after that updates its card. Health is checked nightly. Open
            a PR in the new repo and four gates run automatically against a real preview deployment
            on its own database branch.
          </p>
        </li>
      </ol>

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
