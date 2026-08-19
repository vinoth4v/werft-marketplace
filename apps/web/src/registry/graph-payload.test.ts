import { describe, expect, it } from "vitest"
// The sender lives outside apps/web, because every app repo runs it from its
// own root. Imported here so the two halves of the contract are checked
// against each other rather than each against its own assumptions.
import { summarise } from "../../../../scripts/registry-payload.mjs"
import { graphSummarySchema, MAX_SAMPLE_EDGES, MAX_SAMPLE_NODES } from "./graph-summary.ts"

/** A graph shaped the way graphify writes one: `links`, not `edges`. */
function graphifyGraph(nodeCount: number, edgeCount: number) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `n${i}`,
    label: `node-${i}`,
    community: i % 7,
    source_file: `src/file-${i}.ts`,
  }))
  const links = Array.from({ length: edgeCount }, (_, i) => ({
    source: `n${i % nodeCount}`,
    target: `n${(i * 7 + 3) % nodeCount}`,
    relation: "calls",
  }))
  return { nodes, links, built_at_commit: "cc8df26a89e6233cd98b6673254066de383c7449" }
}

/**
 * `summarise` returns null for a graph with no nodes — tested on its own
 * below. Everywhere else a null is the test failing, not a case to handle.
 */
function summarised(graph: unknown) {
  const summary = summarise(graph)
  if (!summary) throw new Error("expected a summary, got null")
  return summary
}

describe("registry payload summariser", () => {
  it("produces a summary the marketplace's own schema accepts", () => {
    const summary = summarised(graphifyGraph(400, 900))
    const parsed = graphSummarySchema.safeParse(summary)
    expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true)
  })

  it("reports totals for the whole graph, not for the sample it sends", () => {
    const summary = summarised(graphifyGraph(400, 900))
    expect(summary.nodes).toBe(400)
    expect(summary.edges).toBe(900)
    expect(summary.sample.nodes.length).toBe(MAX_SAMPLE_NODES)
  })

  it("stays inside the caps the receiver enforces, on a dense graph", () => {
    const summary = summarised(graphifyGraph(300, 5000))
    expect(summary.sample.nodes.length).toBeLessThanOrEqual(MAX_SAMPLE_NODES)
    expect(summary.sample.edges.length).toBeLessThanOrEqual(MAX_SAMPLE_EDGES)
    expect(graphSummarySchema.safeParse(summary).success).toBe(true)
  })

  it("never emits an edge index outside the sample it sent", () => {
    const summary = summarised(graphifyGraph(500, 3000))
    for (const [a, b] of summary.sample.edges) {
      expect(a).toBeLessThan(summary.sample.nodes.length)
      expect(b).toBeLessThan(summary.sample.nodes.length)
    }
  })

  it("keeps the most connected nodes, not the first ones it read", () => {
    // n0 is deliberately given the most edges while sorting last by name.
    const nodes = Array.from({ length: 200 }, (_, i) => ({
      id: `n${i}`,
      label: `node-${i}`,
      community: 0,
    }))
    const links = Array.from({ length: 300 }, (_, i) => ({
      source: "n0",
      target: `n${(i % 199) + 1}`,
    }))
    const summary = summarised({ nodes, links })
    expect(summary.hubs[0]?.label).toBe("node-0")
  })

  it("handles a graph with no links at all", () => {
    const summary = summarised({ nodes: [{ id: "a", label: "a", community: 0 }], links: [] })
    expect(summary.edges).toBe(0)
    expect(summary.sample.edges).toEqual([])
    expect(graphSummarySchema.safeParse(summary).success).toBe(true)
  })

  it("returns null for an empty graph, so the app posts werft.json alone", () => {
    expect(summarise({ nodes: [], links: [] })).toBeNull()
  })

  it("accepts the `edges` key too, in case a graph is written that way", () => {
    const summary = summarised({
      nodes: [
        { id: "a", label: "a", community: 0 },
        { id: "b", label: "b", community: 0 },
      ],
      edges: [{ source: "a", target: "b" }],
    })
    expect(summary.edges).toBe(1)
  })
})
