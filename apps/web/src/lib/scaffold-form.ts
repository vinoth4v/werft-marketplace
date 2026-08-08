import { z } from "zod"

/**
 * The /new form's contract with werft-template's scaffold-app.yml dispatch.
 *
 * Same name rule as werft.json enforces — the name becomes a repo, a Neon
 * project, a Vercel project and a subdomain, so rejecting it here beats a
 * runner failing three resources in.
 */
const NAME_PATTERN = /^[a-z][a-z0-9-]{0,38}[a-z0-9]$/

export const THEME_KEYS = ["werft", "madras", "deck", "nordlicht", "tinte"] as const
export const REGION_KEYS = ["us-east", "eu-central", "us-west"] as const

export const scaffoldFormSchema = z.object({
  app_name: z.string().regex(NAME_PATTERN, {
    message: "lowercase letters, digits and hyphens; 2–40 characters; no leading/trailing hyphen",
  }),
  // Display name. Blank means "use the app name", which the registry already
  // falls back to, so it stays optional all the way down.
  title: z.string().trim().max(60).default(""),
  description: z.string().trim().min(1, { message: "the registry card needs one line" }),
  email: z.email(),
  tags: z.string().trim().default(""),
  visibility: z.enum(["public", "private"]),
  status: z.enum(["prototype", "active", "paused", "archived"]),
  deploy: z.boolean(),
  vercel_sso: z.boolean(),
  // "" means each provider's own default — the workflow's region input allows
  // it too, so an unregioned app behaves exactly as before.
  region: z.enum(["", ...REGION_KEYS]),
  with_s3: z.boolean(),
  theme: z.enum(THEME_KEYS),
  first_task: z.string().trim().max(2000).default(""),
})

export type ScaffoldForm = z.infer<typeof scaffoldFormSchema>

/**
 * GitHub's dispatch API takes every input as a string, whatever type the
 * workflow declares — booleans included. The YAML side compares against
 * "true"/"false" accordingly.
 */
export function toDispatchInputs(form: ScaffoldForm): Record<string, string> {
  return {
    app_name: form.app_name,
    title: form.title,
    description: form.description,
    email: form.email,
    tags: form.tags,
    visibility: form.visibility,
    status: form.status,
    deploy: String(form.deploy),
    vercel_sso: String(form.vercel_sso),
    region: form.region,
    with_s3: String(form.with_s3),
    theme: form.theme,
    first_task: form.first_task,
  }
}
