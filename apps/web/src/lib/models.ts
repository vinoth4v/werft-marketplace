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
 * Three kinds of thing live here, and the difference matters more than the
 * names do:
 *
 *   Claude, on the subscription. The default, and what anything filed by hand
 *   gets. Spends the window.
 *
 *   A Kompass *lane*. The gateway classifies the request and walks a chain of
 *   a dozen-odd models, so it owns quota, cooldown and fallback — if one model
 *   is down the next one answers. You do not know in advance which model that
 *   is, which is the trade.
 *
 *   A Kompass *pin*. Exactly one model, routing bypassed. You know what
 *   answers, and there is no fallback at all: a provider in cooldown fails the
 *   run rather than quietly becoming something else. Worth it when the point
 *   is to try a specific model; not worth it when the point is to get a build
 *   finished.
 *
 * Nothing here talks to a provider — not to DeepSeek, not to Anthropic. This
 * app only passes the string on to the workflow that runs the harness, which
 * is the same harness in every case: same action, same toolset, same
 * guardrails. Only the credential and the base URL move.
 *
 * The pinned names are slugs, not the gateway's own `kompass:<provider>/<model>`
 * names. The choice travels to the runner inside an issue body as
 * `werft:model=…`, matched by `[a-z0-9.-]+` — a colon and slashes would not
 * survive it, and a provider path out of an issue body is not something to
 * hand to a command line. claude.yml holds the slug -> pin table, and that
 * table is the allowlist.
 *
 * Curated, not exhaustive: the gateway offers 43 pins and this lists the ones
 * that can plausibly drive a headless build — read a repo, write files, run
 * pnpm, drive git and gh. The 8B/20B models and the 24k-context entries are
 * left out on purpose, because a pin has no fallback and offering one that
 * cannot finish is offering a failed run.
 */
export const MODELS = [
  // Claude, on the subscription.
  "",
  "opus",
  "sonnet",
  "haiku",
  // Kompass lanes — the gateway routes, and can fall back.
  "kompass",
  "kompass-fast",
  "kompass-simple",
  "kompass-agentic",
  "kompass-hard",
  "kompass-longctx",
  // Kompass pins — exactly one model, no fallback.
  "deepseek",
  "deepseek-1m",
  "minimax-m3",
  "nemotron-ultra",
  "nemotron-ultra-free",
  "glm-5.2",
  "gemini-3.7-flash",
  "devstral",
  "codestral",
  "laguna-s",
  "big-pickle",
  "mimo",
  "north-mini-code",
  "step-3.7-flash",
] as const

export type Model = (typeof MODELS)[number]

export const MODEL_LABELS: Record<Model, string> = {
  "": "Default — whatever the subscription picks",
  opus: "Opus — most capable, spends the window fastest",
  sonnet: "Sonnet — good for most changes",
  haiku: "Haiku — cheapest, for small mechanical edits",

  kompass: "Auto — the gateway classifies and picks (200k)",
  "kompass-fast": "Fast lane — small, quick work (80k)",
  "kompass-simple": "Simple lane — low-effort requests (190k)",
  "kompass-agentic": "Agentic lane — tool-driven work, the closest to a build (200k)",
  "kompass-hard": "Hard lane — the strongest chain (870k)",
  "kompass-longctx": "Long-context lane — for plans that do not fit elsewhere (870k)",

  deepseek: "DeepSeek v4 Flash — free (200k)",
  "deepseek-1m": "DeepSeek v4 Flash 0731 — a million tokens of context",
  "minimax-m3": "MiniMax M3 (1M)",
  "nemotron-ultra": "Nemotron 3 Ultra 550B (262k)",
  "nemotron-ultra-free": "Nemotron 3 Ultra — free (1M)",
  "glm-5.2": "GLM 5.2 (1M)",
  "gemini-3.7-flash": "Gemini 3.7 Flash (1M)",
  devstral: "Devstral Medium — built for code (262k)",
  codestral: "Codestral 2508 — built for code (256k)",
  "laguna-s": "Poolside Laguna S 2.1 — free (262k)",
  "big-pickle": "Big Pickle (200k)",
  mimo: "MiMo v2.5 — free (200k)",
  "north-mini-code": "Cohere North Mini Code — free (256k)",
  "step-3.7-flash": "StepFun Step 3.7 Flash (262k)",
}

/**
 * The same models, grouped by what actually pays for the run and what happens
 * when the model behind it is unavailable.
 *
 * A flat list put "spends your Claude window", "the gateway will find you
 * something" and "this exact model or nothing" side by side as if they were
 * the same kind of choice. They are not, and a group heading is the cheapest
 * way to say so — it costs a heading, not a paragraph nobody reads.
 *
 * Every model belongs to exactly one group; the test holds that.
 */
export const MODEL_GROUPS: readonly { label: string; models: readonly Model[] }[] = [
  { label: "Claude subscription", models: ["", "opus", "sonnet", "haiku"] },
  {
    label: "Kompass gateway — routed, falls back",
    models: [
      "kompass",
      "kompass-fast",
      "kompass-simple",
      "kompass-agentic",
      "kompass-hard",
      "kompass-longctx",
    ],
  },
  {
    label: "Kompass gateway — pinned, no fallback",
    models: [
      "deepseek",
      "deepseek-1m",
      "minimax-m3",
      "nemotron-ultra",
      "nemotron-ultra-free",
      "glm-5.2",
      "gemini-3.7-flash",
      "devstral",
      "codestral",
      "laguna-s",
      "big-pickle",
      "mimo",
      "north-mini-code",
      "step-3.7-flash",
    ],
  },
]
