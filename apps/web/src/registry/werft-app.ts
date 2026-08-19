import { z } from "zod"
import { graphSummarySchema } from "./graph-summary"

/**
 * What an app posts to /api/registry/upsert — the same shape as werft.json,
 * duplicated rather than imported: this repo is not a workspace member of
 * werft-template, which owns the canonical validator.
 */
export const APP_STATUSES = ["prototype", "active", "paused", "archived"] as const

const NAME_PATTERN = /^[a-z][a-z0-9-]{0,38}[a-z0-9]$/

export const werftAppPayloadSchema = z.object({
  name: z.string().regex(NAME_PATTERN),
  /**
   * How the app brands itself, for display only — "SruthiScribe Learn" rather
   * than the `sruthiscribe-learn` slug that `name` is forced to be by having
   * to serve as a repo, a database and a subdomain at once.
   *
   * Optional, and never a substitute for `name`: nothing is looked up by it.
   * An app that omits it displays its slug, exactly as before.
   */
  title: z.string().trim().min(1).max(60).optional(),
  description: z.string().min(1),
  stack: z.array(z.string().min(1)),
  // z.url() alone validates shape, not scheme — http:// passed it. Every
  // real deploy is Vercel HTTPS, so a non-https, non-empty value is wrong.
  url: z.union([z.literal(""), z.url().refine((value) => value.startsWith("https://"))]),
  tags: z.array(z.string().min(1)),
  status: z.enum(APP_STATUSES),
  private: z.boolean(),
  /**
   * When this app actually last deployed. Omitted by CI — a merge to main
   * deploys, so "now" is the truth there, and every werft.json stays free of
   * a field no app should have to maintain.
   *
   * It exists for the other writer: correcting the metadata of a pre-Werft
   * app that has no CI of its own. Without it, fixing a typo in a
   * description would stamp today over a real deploy date, and the wall —
   * which sorts by this — would reorder itself around an edit that deployed
   * nothing.
   */
  lastDeployAt: z.iso.datetime().optional(),
  /**
   * The app's knowledge graph, summarised by its own CI from the committed
   * graphify-out/graph.json.
   *
   * Optional on purpose, and in both directions: an app scaffolded before
   * graphify existed has none, and an app whose graph build failed should
   * still register itself rather than drop off the wall over a visualisation.
   */
  graph: graphSummarySchema.optional(),
})

export type WerftAppPayload = z.infer<typeof werftAppPayloadSchema>

/** Every scaffolded app's repo is named identically to the app itself. */
export function repoUrlFor(name: string): string {
  return `https://github.com/vinoth4v/${name}`
}
