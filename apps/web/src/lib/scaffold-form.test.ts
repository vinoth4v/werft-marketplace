import { describe, expect, it } from "vitest"
import { scaffoldFormSchema, toDispatchInputs } from "./scaffold-form.ts"

const valid = {
  app_name: "my-app",
  title: "",
  description: "Does a thing.",
  email: "op@example.com",
  tags: "personal",
  visibility: "public",
  status: "prototype",
  deploy: true,
  vercel_sso: false,
  region: "",
  with_s3: false,
  theme: "werft",
  first_task: "",
}

describe("scaffoldFormSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(scaffoldFormSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects a name that could not be a repo, database and subdomain", () => {
    for (const app_name of ["My-App", "has space", "-lead", "trail-", "x", ""]) {
      expect(scaffoldFormSchema.safeParse({ ...valid, app_name }).success, app_name).toBe(false)
    }
  })

  it("rejects an empty description rather than shipping a blank card", () => {
    expect(scaffoldFormSchema.safeParse({ ...valid, description: "  " }).success).toBe(false)
  })

  it("caps the first task, since it becomes an issue body", () => {
    expect(scaffoldFormSchema.safeParse({ ...valid, first_task: "x".repeat(2001) }).success).toBe(
      false,
    )
  })
})

describe("toDispatchInputs", () => {
  it("stringifies booleans, because the dispatch API takes only strings", () => {
    const inputs = toDispatchInputs(scaffoldFormSchema.parse(valid))
    expect(inputs.deploy).toBe("true")
    expect(inputs.vercel_sso).toBe("false")
  })

  it("sends every field the workflow declares, nothing extra", () => {
    const inputs = toDispatchInputs(scaffoldFormSchema.parse(valid))
    expect(Object.keys(inputs).sort()).toEqual([
      "app_name",
      "deploy",
      "description",
      "email",
      "first_task",
      "region",
      "status",
      "tags",
      "theme",
      "title",
      "vercel_sso",
      "visibility",
      "with_s3",
    ])
  })

  it("carries the theme and region choices through verbatim", () => {
    const inputs = toDispatchInputs(
      scaffoldFormSchema.parse({ ...valid, theme: "madras", region: "eu-central", with_s3: true }),
    )
    expect(inputs.theme).toBe("madras")
    expect(inputs.region).toBe("eu-central")
    expect(inputs.with_s3).toBe("true")
  })

  it("carries the display name through, and blank means use the slug", () => {
    expect(toDispatchInputs(scaffoldFormSchema.parse({ ...valid, title: "My App" })).title).toBe(
      "My App",
    )
    expect(toDispatchInputs(scaffoldFormSchema.parse(valid)).title).toBe("")
  })
})
