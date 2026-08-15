/**
 * Which model answers a request.
 *
 * A one-line fix and a full build plan should not cost the same. The
 * subscription's window is finite, so the choice is the difference between
 * having the strongest model available when the work needs it and having
 * spent it renaming a button.
 *
 * Blank means the subscription's own default — the right answer when you have
 * no opinion, and what every request did before this existed. The values are
 * matched against an allowlist in claude.yml before they ever reach a command
 * line, so this list is a convenience rather than the security boundary.
 *
 * `deepseek` is the odd one out: it does not name a Claude model at all. It
 * asks the runner to point its harness at the Kompass gateway, which routes to
 * a DeepSeek lane. That spends no subscription window, which is the whole
 * reason to pick it — and costs latency and capability, which is the whole
 * reason not to. Nothing here talks to DeepSeek, or to any provider: this app
 * only passes the string on to the workflow that runs the harness.
 *
 * That workflow has to meet it halfway, and today it does not. werft-template
 * declares this input as `type: choice` in scaffold-app.yml and
 * request-feature.yml, so GitHub rejects a dispatch carrying a value those
 * lists do not contain — a 422 the form shows as an error, not a quiet
 * fallback to the default. claude.yml then has its own allowlist
 * (`opus|sonnet|haiku`) and the Kompass wiring claude-escalate.yml already
 * uses. Until all three change, `deepseek` is an option that fails loudly.
 */
export const MODELS = ["", "opus", "sonnet", "haiku", "deepseek"] as const

export type Model = (typeof MODELS)[number]

export const MODEL_LABELS: Record<Model, string> = {
  "": "Default — whatever the subscription picks",
  opus: "Opus — most capable, spends the window fastest",
  sonnet: "Sonnet — good for most changes",
  haiku: "Haiku — cheapest, for small mechanical edits",
  deepseek: "DeepSeek — free lane, slower, spends no subscription window",
}

/**
 * The same models, grouped by what actually pays for the run.
 *
 * A flat list put "spends your Claude window" and "spends nothing" side by
 * side as if they were the same kind of choice. They are not, and the group
 * heading is the cheapest way to say so — it costs a heading, not a paragraph
 * nobody reads.
 *
 * Every model belongs to exactly one group; the test holds that.
 */
export const MODEL_GROUPS: readonly { label: string; models: readonly Model[] }[] = [
  { label: "Claude subscription", models: ["", "opus", "sonnet", "haiku"] },
  { label: "Kompass gateway", models: ["deepseek"] },
]
