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
 */
export const MODELS = ["", "opus", "sonnet", "haiku"] as const

export type Model = (typeof MODELS)[number]

export const MODEL_LABELS: Record<Model, string> = {
  "": "Default — whatever the subscription picks",
  opus: "Opus — most capable, spends the window fastest",
  sonnet: "Sonnet — good for most changes",
  haiku: "Haiku — cheapest, for small mechanical edits",
}
