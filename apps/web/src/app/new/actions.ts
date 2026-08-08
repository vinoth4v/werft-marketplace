"use server"

import { redirect } from "next/navigation"
import { scaffoldFormSchema, toDispatchInputs } from "@/lib/scaffold-form"

const DISPATCH_URL =
  "https://api.github.com/repos/vinoth4v/werft-template/actions/workflows/scaffold-app.yml/dispatches"

/**
 * Dispatches werft-template's scaffold workflow with this form's values.
 *
 * A server action behind the session gate, on purpose: only the signed-in
 * operator can reach it, and the GitHub token that authorises the dispatch
 * lives only in this app's server environment — the browser never sees a
 * credential, and the marketplace never holds the Neon/Vercel/Kompass
 * secrets at all. Those stay in werft-template, where the runner is.
 */
export async function scaffoldAction(formData: FormData): Promise<void> {
  const token = process.env.GH_DISPATCH_TOKEN
  if (!token) {
    redirect("/new?error=GH_DISPATCH_TOKEN+is+not+configured+on+this+deployment")
  }

  const parsed = scaffoldFormSchema.safeParse({
    app_name: String(formData.get("app_name") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    email: String(formData.get("email") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    visibility: String(formData.get("visibility") ?? ""),
    status: String(formData.get("status") ?? ""),
    region: String(formData.get("region") ?? ""),
    theme: String(formData.get("theme") ?? "werft"),
    // Checkboxes: present when ticked, absent when not.
    deploy: formData.get("deploy") === "on",
    with_s3: formData.get("with_s3") === "on",
    vercel_sso: formData.get("vercel_sso") === "on",
    build_plan: String(formData.get("build_plan") ?? ""),
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    redirect(`/new?error=${encodeURIComponent(`${first?.path.join(".")}: ${first?.message}`)}`)
  }

  const response = await fetch(DISPATCH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: "main", inputs: toDispatchInputs(parsed.data) }),
  })

  // 204 is the only success GitHub sends for a dispatch.
  if (response.status !== 204) {
    const body = await response.text().catch(() => "")
    redirect(
      `/new?error=${encodeURIComponent(`GitHub refused the dispatch (${response.status}): ${body.slice(0, 200)}`)}`,
    )
  }

  redirect(`/new?dispatched=${encodeURIComponent(parsed.data.app_name)}`)
}
