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

  it("treats lastDeployAt as optional, so every werft.json stays free of it", () => {
    expect(werftAppPayloadSchema.safeParse(valid).success).toBe(true)
    expect("lastDeployAt" in valid).toBe(false)
  })

  it("accepts a real deploy date, so correcting a description cannot invent one", () => {
    const parsed = werftAppPayloadSchema.safeParse({
      ...valid,
      lastDeployAt: "2026-06-19T22:25:43.000Z",
    })
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.lastDeployAt).toBe("2026-06-19T22:25:43.000Z")
  })

  it("rejects a lastDeployAt that is not a real timestamp", () => {
    for (const bad of ["yesterday", "2026-13-01T00:00:00Z", "1750000000"]) {
      expect(werftAppPayloadSchema.safeParse({ ...valid, lastDeployAt: bad }).success, bad).toBe(
        false,
      )
    }
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
