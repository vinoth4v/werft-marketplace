import { expect, test } from "@playwright/test"

test("an unauthenticated visitor is sent to the login page", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.getByLabel("Password")).toBeVisible()

  // The gate has to actually withhold the page, not merely change the URL.
  await expect(page.getByText("Replace this page")).toHaveCount(0)
})

test("the login page is styled by the token stylesheet", async ({ page }) => {
  await page.goto("/login")

  // Proves the generated CSS was built and served — a missing dist/tokens.css
  // leaves this custom property undefined.
  const background = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim(),
  )

  expect(background).not.toBe("")
})

test("the registry API is not gated by the session", async ({ request }) => {
  // Every other app's CI calls this with no session cookie at all — it has
  // its own bearer-token check instead. Regression test for a real bug: the
  // proxy matcher exempted api/auth but not api/registry, so this 307'd to
  // /login even with a correct token, which looked like an auth failure.
  // maxRedirects: 0 — otherwise the fixture follows the 307 to /login and
  // reports that page's 200, silently hiding the exact bug this guards.
  const response = await request.post("/api/registry/upsert", { data: {}, maxRedirects: 0 })

  expect(response.status()).not.toBe(307)
  // No token was sent, so the route's own check should reject it — just not
  // by redirecting to a login page it was never supposed to reach.
  expect(response.status()).toBe(401)
})

test("the new-app instructions page is gated like everything else", async ({ page }) => {
  // /new is operator documentation with the operator's own paths in it —
  // closed by default is the template's whole posture, and a new route is
  // protected because it exists.
  await page.goto("/new")
  await expect(page).toHaveURL(/\/login/)
})

test("the favicon is served without a session", async ({ request }) => {
  // app/icon.svg is served at /icon.svg, which the gate's matcher must
  // exempt — otherwise every signed-out tab shows a broken icon.
  const response = await request.get("/icon.svg", { maxRedirects: 0 })

  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toContain("svg")
})

test("registry removal rejects an unauthenticated request", async ({ request }) => {
  const response = await request.delete("/api/registry/apps/anything", { maxRedirects: 0 })

  expect(response.status()).not.toBe(307)
  expect(response.status()).toBe(401)
})

test("the health-check cron rejects an unauthenticated request", async ({ request }) => {
  // Fails closed: an absent or wrong Authorization header is always 401,
  // whether or not CRON_SECRET happens to be configured in this environment.
  const response = await request.get("/api/registry/health-check", { maxRedirects: 0 })

  expect(response.status()).not.toBe(307)
  expect(response.status()).toBe(401)
})
