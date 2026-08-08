import { describe, expect, it } from "vitest"
import { repoUrlFor, werftAppPayloadSchema } from "./werft-app.ts"

const valid = {
  name: "example-app",
  description: "An app that does a thing.",
  stack: ["next", "neon"],
  url: "https://example-app.vercel.app",
  tags: ["personal"],
  status: "active",
  private: true,
}

describe("werftAppPayloadSchema", () => {
  it("accepts a well-formed payload", () => {
    expect(werftAppPayloadSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts an empty url, for an app not deployed yet", () => {
    expect(werftAppPayloadSchema.safeParse({ ...valid, url: "" }).success).toBe(true)
  })

  it("rejects a name that could not be a repo, Neon and Vercel project", () => {
    for (const name of ["Example", "has space", "-leading", "trailing-", "x", ""]) {
      expect(werftAppPayloadSchema.safeParse({ ...valid, name }).success, name).toBe(false)
    }
  })

  it("rejects a non-empty, non-https url", () => {
    expect(werftAppPayloadSchema.safeParse({ ...valid, url: "http://example.com" }).success).toBe(
      false,
    )
  })

  it("rejects an unknown status", () => {
    expect(werftAppPayloadSchema.safeParse({ ...valid, status: "live" }).success).toBe(false)
  })

  it("rejects a missing field rather than defaulting it", () => {
    const { description: _description, ...withoutDescription } = valid
    expect(werftAppPayloadSchema.safeParse(withoutDescription).success).toBe(false)
  })
})

describe("repoUrlFor", () => {
  it("derives the repo URL from the app name", () => {
    expect(repoUrlFor("example-app")).toBe("https://github.com/vinoth4v/example-app")
  })
})
