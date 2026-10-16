import { z } from "zod"

/**
 * A knowledge-graph summary, as an app's CI reports it.
 *
 * Apps commit `graphify-out/graph.json`, but a real one runs to hundreds of
 * kilobytes — too big to hold a row per app, and far too big to send to a
 * browser. So CI sends a *summary*: the true totals, the most-connected
 * concepts, and a bounded sample of the graph big enough to draw.
 *
 * The bounds below are not advice. This payload arrives over HTTP from every
 * app repo's CI, so the limits are the contract: a graph that outgrows them
 * is truncated by the sender and rejected by the receiver if it is not.
 */

/** Most-connected nodes shown as a list. Small: this is a summary, not a map. */
export const MAX_HUBS = 8

/**
 * Nodes in the drawable sample. 150 keeps the payload around 15KB and stays
 * legible on a card-sized canvas — past roughly this many, a force layout at
 * this scale is a hairball whatever we do with it.
 */
export const MAX_SAMPLE_NODES = 150

/** Edges in the sample. Dense graphs hit this long before the node cap. */
export const MAX_SAMPLE_EDGES = 600

const hubSchema = z.object({
  label: z.string().min(1).max(120),
  degree: z.number().int().nonnegative(),
})

const sampleNodeSchema = z.object({
  /** Display label, already trimmed by the sender. */
  label: z.string().min(1).max(120),
  /** Community index, for colouring. Not stable across rebuilds — presentational only. */
  community: z.number().int().nonnegative(),
  degree: z.number().int().nonnegative(),
})

/**
 * Edges are index pairs into `sample.nodes`, not id strings. An id-per-endpoint
 * costs more than the node list itself on a graph this shape.
 */
const sampleEdgeSchema = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])

export const graphSummarySchema = z
  .object({
    /** Totals for the *whole* graph, not the sample. */
    nodes: z.number().int().nonnegative(),
    edges: z.number().int().nonnegative(),
    communities: z.number().int().nonnegative(),
    /** Commit the graph was built from, when the sender knows it. */
    builtFrom: z.string().max(64).optional(),
    hubs: z.array(hubSchema).max(MAX_HUBS),
    sample: z.object({
      nodes: z.array(sampleNodeSchema).max(MAX_SAMPLE_NODES),
      edges: z.array(sampleEdgeSchema).max(MAX_SAMPLE_EDGES),
    }),
  })
  /**
   * An edge pointing past the end of the node list would crash the renderer.
   * Checked here rather than defended against in the component: the boundary
   * is where a malformed payload should stop.
   */
  .refine(
    (summary) =>
      summary.sample.edges.every(
        ([a, b]) => a < summary.sample.nodes.length && b < summary.sample.nodes.length,
      ),
    { message: "sample edge refers to a node index that does not exist" },
  )

export type GraphSummary = z.infer<typeof graphSummarySchema>
export type GraphHub = z.infer<typeof hubSchema>
