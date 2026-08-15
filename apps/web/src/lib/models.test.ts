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

  it("offers the gateway lane as well as the subscription", () => {
    expect(MODELS).toContain("deepseek")
    const gateway = MODEL_GROUPS.find((group) => group.label === "Kompass gateway")
    expect(gateway?.models).toContain("deepseek")
  })
})
