"use server"

import { redirect } from "next/navigation"
import { MODELS } from "@/lib/models"

/**
 * Per-app actions: ask for a change, or retire the app.
 *
 * Both dispatch a workflow in werft-template rather than acting directly, for
 * the same reason creating an app does: that repo holds the credentials — Neon,
 * Vercel, AWS, a repo-writing GitHub token — and this app holds one token whose
 * only power is to ask. A web page that could delete a database directly would
 * be a much larger thing to get right.
 */

const DISPATCH = (workflow: string): string =>
  `https://api.github.com/repos/vinoth4v/werft-template/actions/workflows/${workflow}/dispatches`

async function dispatch(
  workflow: string,
  inputs: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.GH_DISPATCH_TOKEN
  if (!token) return { ok: false, error: "GH_DISPATCH_TOKEN is not configured on this deployment" }

  const response = await fetch(DISPATCH(workflow), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: "main", inputs }),
  }).catch(() => null)

  if (!response) return { ok: false, error: "could not reach GitHub" }
  // 204 is the only success a dispatch returns.
  if (response.status !== 204) {
    const body = await response.text().catch(() => "")
    return {
      ok: false,
      error: `GitHub refused the dispatch (${response.status}): ${body.slice(0, 200)}`,
    }
  }
  return { ok: true }
}

/**
 * Files the request as an @claude issue in the app's own repo, where Claude
 * Code can read the code and open a pull request against it.
 */
export async function requestFeatureAction(formData: FormData): Promise<void> {
  const app = String(formData.get("app_name") ?? "")
  const request = String(formData.get("request") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const model = String(formData.get("model") ?? "").trim()

  if (request === "") {
    redirect(`/apps/${app}?error=${encodeURIComponent("describe the change first")}`)
  }
  if (request.length > 20_000) {
    redirect(`/apps/${app}?error=${encodeURIComponent("that is longer than 20,000 characters")}`)
  }

  // Validated here as well as in the workflow: this ends up as a command-line
  // argument, and a form field is not a trustworthy source for one. Checked
  // against MODELS rather than a copy of it — a copy is how a model added to
  // the picker gets accepted by the form and dropped on the way out.
  const chosen = (MODELS as readonly string[]).includes(model) ? model : ""
  const result = await dispatch("request-feature.yml", {
    app_name: app,
    request,
    title,
    model: chosen,
  })
  redirect(
    result.ok
      ? `/apps/${app}?requested=1`
      : `/apps/${app}?error=${encodeURIComponent(result.error)}`,
  )
}

/**
 * Retires the app: everything it owns, gone.
 *
 * The typed name is checked here as well as in the browser and again in the
 * workflow. Three places for one guard is not redundancy worth removing — this
 * is the one action in the product that cannot be undone.
 */
export async function retireAppAction(formData: FormData): Promise<void> {
  const app = String(formData.get("app_name") ?? "")
  const confirm = String(formData.get("confirm") ?? "").trim()
  const deleteRepo = formData.get("delete_repo") === "on"

  if (confirm !== app) {
    redirect(
      `/apps/${app}?error=${encodeURIComponent("the name you typed did not match — nothing was touched")}`,
    )
  }
  if (app === "werft-template" || app === "werft-marketplace") {
    redirect(
      `/apps/${app}?error=${encodeURIComponent("that is Werft itself, not an app it built — refusing")}`,
    )
  }

  const result = await dispatch("retire-app.yml", {
    app_name: app,
    confirm,
    delete_repo: String(deleteRepo),
    dry_run: "false",
  })
  redirect(
    result.ok
      ? `/apps/${app}?retiring=1`
      : `/apps/${app}?error=${encodeURIComponent(result.error)}`,
  )
}

/**
 * Merges a pull request, by asking the runner that holds the credential.
 *
 * The button only appears when every gate is green, but this action does not
 * rely on that and neither does the workflow: gate state is read again from
 * GitHub immediately before the merge, and a pending check is refused as firmly
 * as a failing one. A page that has been open for ten minutes is not an
 * authorisation.
 */
export async function mergePullRequestAction(formData: FormData): Promise<void> {
  const app = String(formData.get("app_name") ?? "")
  const pr = String(formData.get("pr") ?? "").trim()

  if (!/^[0-9]+$/.test(pr)) {
    redirect(`/apps/${app}?error=${encodeURIComponent("that is not a pull request number")}`)
  }
  if (app === "werft-template" || app === "werft-marketplace") {
    redirect(
      `/apps/${app}?error=${encodeURIComponent("that is Werft itself — merge its pull requests on GitHub")}`,
    )
  }

  const result = await dispatch("merge-pr.yml", { app_name: app, pr })
  redirect(
    result.ok
      ? `/apps/${app}?merging=${pr}`
      : `/apps/${app}?error=${encodeURIComponent(result.error)}`,
  )
}
