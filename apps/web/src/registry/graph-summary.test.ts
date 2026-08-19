import { describe, expect, it } from "vitest"
import { graphSummarySchema, MAX_SAMPLE_EDGES, MAX_SAMPLE_NODES } from "./graph-summary.ts"

const valid = {
  nodes: 515,
  edges: 799,
  communities: 30,
  builtFrom: "cc8df26a89e6233cd98b6673254066de383c7449",
  hubs: [
    { label: "scaffold.ts", degree: 42 },
    { label: "scaffold()", degree: 27 },
  ],
  sample: {
    nodes: [
      { label: "scaffold.ts", community: 0, degree: 42 },
      { label: "scaffold()", community: 0, degree: 27 },
      { label: "queries.ts", community: 1, degree: 9 },
    ],
    edges: [
      [0, 1],
      [1, 2],
    ],
  },
}

describe("graphSummarySchema", () => {
  it("accepts a well-formed summary", () => {
    expect(graphSummarySchema.safeParse(valid).success).toBe(true)
  })

  it("treats builtFrom as optional, for a graph built outside a git checkout", () => {
    const { builtFrom, ...rest } = valid
    expect(graphSummarySchema.safeParse(rest).success).toBe(true)
  })

  it("accepts a graph with no edges at all", () => {
    const lonely = { ...valid, sample: { nodes: valid.sample.nodes, edges: [] } }
    expect(graphSummarySchema.safeParse(lonely).success).toBe(true)
  })

  /**
   * The renderer indexes straight into sample.nodes. An out-of-range endpoint
   * would be a crash on the page, so it has to be a rejection at the boundary.
   */
  it("rejects an edge pointing past the end of the node list", () => {
    const broken = {
      ...valid,
      sample: { nodes: valid.sample.nodes, edges: [[0, 99]] },
    }
    expect(graphSummarySchema.safeParse(broken).success).toBe(false)
  })

  it("rejects a sample larger than the cap, rather than truncating it silently", () => {
    const tooMany = {
      ...valid,
      sample: {
        nodes: Array.from({ length: MAX_SAMPLE_NODES + 1 }, (_, i) => ({
          label: `n${i}`,
          community: 0,
          degree: 1,
        })),
        edges: [],
      },
    }
    expect(graphSummarySchema.safeParse(tooMany).success).toBe(false)
  })

  it("rejects more edges than the cap", () => {
    const tooMany = {
      ...valid,
      sample: {
        nodes: valid.sample.nodes,
        edges: Array.from({ length: MAX_SAMPLE_EDGES + 1 }, () => [0, 1]),
      },
    }
    expect(graphSummarySchema.safeParse(tooMany).success).toBe(false)
  })

  it("rejects negative counts", () => {
    expect(graphSummarySchema.safeParse({ ...valid, nodes: -1 }).success).toBe(false)
  })
})
