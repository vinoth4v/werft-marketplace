import { describe, expect, it } from "vitest"
import { formatRelative, formatUtc } from "./time.ts"

const NOW = new Date("2026-08-08T14:00:00Z")

function ago(seconds: number): Date {
  return new Date(NOW.getTime() - seconds * 1000)
}

describe("formatRelative", () => {
  it("says just now under a minute", () => {
    expect(formatRelative(ago(0), NOW)).toBe("just now")
    expect(formatRelative(ago(59), NOW)).toBe("just now")
  })

  it("uses the singular exactly at one of a unit", () => {
    expect(formatRelative(ago(60), NOW)).toBe("1 minute ago")
    expect(formatRelative(ago(3600), NOW)).toBe("1 hour ago")
    expect(formatRelative(ago(86_400), NOW)).toBe("1 day ago")
  })

  it("pluralises everything else", () => {
    expect(formatRelative(ago(120), NOW)).toBe("2 minutes ago")
    expect(formatRelative(ago(7_200), NOW)).toBe("2 hours ago")
    expect(formatRelative(ago(1_209_600), NOW)).toBe("2 weeks ago")
  })

  it("floors rather than rounds, so 119 minutes is still 1 hour ago", () => {
    expect(formatRelative(ago(119 * 60), NOW)).toBe("1 hour ago")
  })

  it("treats a future date as clock skew, not information", () => {
    expect(formatRelative(new Date(NOW.getTime() + 60_000), NOW)).toBe("just now")
  })
})

describe("formatUtc", () => {
  it("renders a deterministic UTC string regardless of server locale", () => {
    expect(formatUtc(new Date("2026-08-08T13:11:03.006Z"))).toBe("8 Aug 2026, 13:11 UTC")
  })

  it("zero-pads hours and minutes", () => {
    expect(formatUtc(new Date("2026-01-02T05:07:00Z"))).toBe("2 Jan 2026, 05:07 UTC")
  })
})
