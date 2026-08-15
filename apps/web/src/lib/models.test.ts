import { describe, expect, it } from "vitest"
import { MODEL_GROUPS, MODEL_LABELS, MODELS } from "./models.ts"

describe("models", () => {
  it("puts every model in exactly one group", () => {
    // The picker renders groups, not the flat list. A model missing from every
    // group is a model nobody can choose; a model in two is a duplicate option
    // in the dropdown. Neither shows up in a typecheck.
    const grouped = MODEL_GROUPS.flatMap((group) => group.models)
    expect([...grouped].sort()).toEqual([...MODELS].sort())
    expect(new Set(grouped).size).toBe(grouped.length)
  })

  it("labels every model", () => {
    for (const model of MODELS) {
      expect(MODEL_LABELS[model]).toBeTruthy()
    }
  })

  it("keeps every value shaped like something the runner will read", () => {
    // Blank is the subscription default and stays blank. Everything else has to
    // match the werft:model= pattern the workflow greps for, and has to be safe
    // as a command-line argument at the far end.
    for (const model of MODELS) {
      if (model === "") continue
      expect(model).toMatch(/^[a-z0-9.-]+$/)
    }
  })

  it("keeps routed and pinned as separate groups, because they fail differently", () => {
    // A lane can fall back across its chain; a pin cannot fall back at all.
    // Collapsing them into one "Kompass" group would hide the only difference
    // that matters when a provider goes down mid-build.
    const routed = MODEL_GROUPS.find((group) => group.label.includes("routed"))
    const pinned = MODEL_GROUPS.find((group) => group.label.includes("pinned"))
    expect(routed?.models).toContain("kompass-hard")
    expect(pinned?.models).toContain("deepseek")
    expect(routed?.models).not.toContain("deepseek")
  })

  it("names every lane exactly as the gateway does, since those pass straight through", () => {
    // Lane slugs are not translated by claude.yml — they are handed to
    // --model verbatim, so a typo here is a typo the gateway rejects.
    const routed = MODEL_GROUPS.find((group) => group.label.includes("routed"))
    expect([...(routed?.models ?? [])].sort()).toEqual([
      "kompass",
      "kompass-agentic",
      "kompass-fast",
      "kompass-hard",
      "kompass-longctx",
      "kompass-simple",
    ])
  })

  it("keeps pinned slugs clear of the lane namespace", () => {
    // A pin named `kompass-something` would be indistinguishable from a lane
    // in claude.yml's case, and would silently route instead of pinning.
    const pinned = MODEL_GROUPS.find((group) => group.label.includes("pinned"))
    for (const model of pinned?.models ?? []) {
      expect(model.startsWith("kompass")).toBe(false)
    }
  })
})
