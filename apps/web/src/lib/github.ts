/**
 * What GitHub knows about an app's open pull requests.
 *
 * Read-only, and read straight from GitHub rather than cached: a merge button
 * showing a stale green tick is worse than no button, because it invites a
 * click that the merge workflow will then refuse.
 *
 * The token is optional. Every app repository here is public, so this works
 * unauthenticated — the token only raises the rate limit, and its absence
 * degrades to fewer requests per hour rather than to no information.
 */

const API = "https://api.github.com"
const OWNER = "vinoth4v"

export type Gate = {
  name: string
  /** GitHub's own words, kept rather than mapped, so an unfamiliar state shows
   * as itself instead of being flattened into "failed". */
  status: string
  conclusion: string | null
}

export type OpenPr = {
  number: number
  title: string
  url: string
  headRef: string
  updatedAt: string
  draft: boolean
  gates: Gate[]
  /** True only when every gate has finished and none of them failed. The merge
   * workflow re-derives this from GitHub before merging; this is for the UI. */
  mergeable: boolean
  /** Why it is not mergeable, in a sentence a human can act on. */
  blockedBecause: string | null
}

function headers(): HeadersInit {
  const token = process.env.GH_DISPATCH_TOKEN
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/** A gate that finished and did not fail. Skipped and neutral count: this fleet
 * skips preview-smoke legitimately when its database job does not run. */
function passed(gate: Gate): boolean {
  return (
    gate.status === "completed" &&
    (gate.conclusion === "success" ||
      gate.conclusion === "skipped" ||
      gate.conclusion === "neutral")
  )
}

export function summarise(
  gates: readonly Gate[],
  draft: boolean,
): {
  mergeable: boolean
  blockedBecause: string | null
} {
  if (draft) return { mergeable: false, blockedBecause: "it is still a draft" }
  if (gates.length === 0) {
    // No checks yet is not the same as no checks required — they may not have
    // started. Saying so beats showing a button that would be refused.
    return { mergeable: false, blockedBecause: "its checks have not started yet" }
  }

  const running = gates.filter((gate) => gate.status !== "completed")
  if (running.length > 0) {
    return {
      mergeable: false,
      blockedBecause: `${running.length} check${running.length === 1 ? "" : "s"} still running`,
    }
  }

  const failed = gates.filter((gate) => !passed(gate))
  if (failed.length > 0) {
    return { mergeable: false, blockedBecause: `${failed.map((g) => g.name).join(", ")} failed` }
  }

  return { mergeable: true, blockedBecause: null }
}

/**
 * Open pull requests for an app, each with its gates.
 *
 * Returns an empty list on any failure — a marketplace page that will not
 * render because GitHub is briefly unavailable is a worse outcome than one that
 * shows no pull requests and lets you use the rest of it.
 */
export async function openPullRequests(app: string): Promise<OpenPr[]> {
  const listed = await fetch(`${API}/repos/${OWNER}/${app}/pulls?state=open&per_page=10`, {
    headers: headers(),
    // The whole point is freshness; a cached green tick invites a refused click.
    cache: "no-store",
  }).catch(() => null)
  if (!listed?.ok) return []

  const raw = (await listed.json().catch(() => null)) as
    | {
        number: number
        title: string
        html_url: string
        draft: boolean
        updated_at: string
        head: { ref: string; sha: string }
      }[]
    | null
  if (!raw) return []

  return Promise.all(
    raw.map(async (pr) => {
      const checks = await fetch(`${API}/repos/${OWNER}/${app}/commits/${pr.head.sha}/check-runs`, {
        headers: headers(),
        cache: "no-store",
      }).catch(() => null)

      const body = checks?.ok
        ? ((await checks.json().catch(() => null)) as {
            check_runs?: { name: string; status: string; conclusion: string | null }[]
          } | null)
        : null

      const gates: Gate[] = (body?.check_runs ?? []).map((run) => ({
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
      }))

      const { mergeable, blockedBecause } = summarise(gates, pr.draft)
      return {
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        headRef: pr.head.ref,
        updatedAt: pr.updated_at,
        draft: pr.draft,
        gates,
        mergeable,
        blockedBecause,
      }
    }),
  )
}
