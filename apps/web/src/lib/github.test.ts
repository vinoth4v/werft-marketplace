import { describe, expect, it } from "vitest"
import { type Gate, summarise } from "./github.ts"

const gate = (name: string, status: string, conclusion: string | null): Gate => ({
  name,
  status,
  conclusion,
})

const green = (name: string) => gate(name, "completed", "success")

describe("summarise", () => {
  it("offers the merge when every gate has finished and passed", () => {
    const result = summarise(
      ["gitleaks", "typecheck", "build", "neon-preview-branch", "preview-smoke"].map(green),
      false,
    )
    expect(result).toEqual({ mergeable: true, blockedBecause: null })
  })

  it("refuses while anything is still running, and says how many", () => {
    // The distinction that matters: a pending check is not a passed one, and a
    // button offered here would be refused by the workflow anyway.
    const result = summarise([green("build"), gate("preview-smoke", "in_progress", null)], false)
    expect(result.mergeable).toBe(false)
    expect(result.blockedBecause).toBe("1 check still running")
  })

  it("names the gates that failed, so the reason is actionable", () => {
    const result = summarise([green("build"), gate("preview-smoke", "completed", "failure")], false)
    expect(result.mergeable).toBe(false)
    expect(result.blockedBecause).toContain("preview-smoke")
  })

  it("treats skipped and neutral as fine, because this fleet skips legitimately", () => {
    // preview-smoke skips when the Neon job it depends on does not run. Calling
    // that a failure would make the button permanently unavailable for a reason
    // unrelated to the change.
    const result = summarise(
      [
        green("build"),
        gate("preview-smoke", "completed", "skipped"),
        gate("x", "completed", "neutral"),
      ],
      false,
    )
    expect(result.mergeable).toBe(true)
  })

  it("refuses a draft even when everything is green", () => {
    expect(summarise([green("build")], true)).toEqual({
      mergeable: false,
      blockedBecause: "it is still a draft",
    })
  })

  it("refuses when no checks exist rather than assuming none are required", () => {
    // An empty list means they may not have started. Treating it as "nothing to
    // check, go ahead" is the one reading that could let anything through.
    const result = summarise([], false)
    expect(result.mergeable).toBe(false)
    expect(result.blockedBecause).toContain("not started")
  })

  it("counts an unfamiliar conclusion as a failure, not a pass", () => {
    // GitHub can add conclusions. Anything unrecognised must block: guessing in
    // the permissive direction is how a gate stops being a gate.
    const result = summarise([gate("build", "completed", "action_required")], false)
    expect(result.mergeable).toBe(false)
  })
})
