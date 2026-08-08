import { z } from "zod"

/**
 * What an app posts to /api/registry/upsert — the same shape as werft.json,
 * duplicated rather than imported: this repo is not a workspace member of
 * werft-template, which owns the canonical validator.
 */
export const APP_STATUSES = ["prototype", "active", "paused", "archived"] as const

const NAME_PATTERN = /^[a-z][a-z0-9-]{0,38}[a-z0-9]$/

export const werftAppPayloadSchema = z.object({
  name: z.string().regex(NAME_PATTERN),
  description: z.string().min(1),
  stack: z.array(z.string().min(1)),
  // z.url() alone validates shape, not scheme — http:// passed it. Every
  // real deploy is Vercel HTTPS, so a non-https, non-empty value is wrong.
  url: z.union([z.literal(""), z.url().refine((value) => value.startsWith("https://"))]),
  tags: z.array(z.string().min(1)),
  status: z.enum(APP_STATUSES),
  private: z.boolean(),
})

export type WerftAppPayload = z.infer<typeof werftAppPayloadSchema>

/** Every scaffolded app's repo is named identically to the app itself. */
export function repoUrlFor(name: string): string {
  return `https://github.com/vinoth4v/${name}`
}
