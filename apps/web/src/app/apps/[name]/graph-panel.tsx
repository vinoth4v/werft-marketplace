"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { GraphSummary } from "@/registry/graph-summary"

type Props = {
  summary: GraphSummary
  appName: string
  repoUrl: string
}

type Placed = { x: number; y: number; vx: number; vy: number }

const HEIGHT = 320
/**
 * Enough ticks for a graph this size to stop moving. The layout is run to
 * completion either way — animating only decides whether you watch it happen.
 */
const TICKS = 320

/**
 * Deterministic start positions.
 *
 * A seeded ring rather than Math.random(): the same app must draw the same
 * shape on every visit, otherwise the picture stops being recognisable as
 * *this* app's graph and the reader learns nothing from returning to it.
 */
function seededLayout(count: number, seed: number): Placed[] {
  const placed: Placed[] = []
  let state = seed || 1
  for (let i = 0; i < count; i++) {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296
    const jitter = state / 4_294_967_296
    const angle = (i / count) * Math.PI * 2
    const radius = 40 + jitter * 90
    placed.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, vx: 0, vy: 0 })
  }
  return placed
}

function hashSeed(text: string): number {
  let hash = 2_166_136_261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16_777_619)
  }
  return Math.abs(hash)
}

/**
 * Communities get hues spread around the wheel. There is no categorical
 * palette in the token set, and inventing eight fixed brand colours here
 * would drift from the theme the moment anyone edits it — so this derives
 * from position on the wheel and leaves lightness to the theme check below.
 */
function communityColor(community: number, dark: boolean): string {
  const hue = (community * 47) % 360
  return dark ? `hsl(${hue} 55% 62%)` : `hsl(${hue} 52% 45%)`
}

function readVar(el: Element, name: string, fallback: string): string {
  const value = getComputedStyle(el).getPropertyValue(name).trim()
  return value === "" ? fallback : value
}

export function GraphPanel({ summary, appName, repoUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const positionsRef = useRef<Placed[]>([])
  const hoveredRef = useRef<number | null>(null)

  const { nodes, edges } = summary.sample

  /** Neighbours per node, for the hover highlight. Built once per payload. */
  const neighbours = useMemo(() => {
    const map: number[][] = nodes.map(() => [])
    for (const [a, b] of edges) {
      map[a]?.push(b)
      map[b]?.push(a)
    }
    return map
  }, [nodes, edges])

  useEffect(() => {
    hoveredRef.current = hovered
  }, [hovered])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const edgeColor = readVar(canvas, "--color-border", dark ? "#333" : "#ddd")
    const labelColor = readVar(canvas, "--color-fg", dark ? "#eee" : "#111")

    const positions = positionsRef.current
    if (positions.length === 0) return

    // Fit the settled layout to the canvas rather than assuming a scale: the
    // spread depends on how connected the graph turned out to be.
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const p of positions) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    const pad = 26
    const spanX = Math.max(maxX - minX, 1)
    const spanY = Math.max(maxY - minY, 1)
    const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY)
    const offsetX = (width - spanX * scale) / 2 - minX * scale
    const offsetY = (height - spanY * scale) / 2 - minY * scale
    const sx = (p: Placed) => p.x * scale + offsetX
    const sy = (p: Placed) => p.y * scale + offsetY

    ctx.clearRect(0, 0, width, height)

    const active = hoveredRef.current
    const lit = active === null ? null : new Set([active, ...(neighbours[active] ?? [])])

    ctx.lineWidth = 1
    for (const [a, b] of edges) {
      const pa = positions[a]
      const pb = positions[b]
      if (!pa || !pb) continue
      const isLit = lit !== null && lit.has(a) && lit.has(b)
      ctx.globalAlpha = lit === null ? 0.35 : isLit ? 0.85 : 0.08
      ctx.strokeStyle = edgeColor
      ctx.beginPath()
      ctx.moveTo(sx(pa), sy(pa))
      ctx.lineTo(sx(pb), sy(pb))
      ctx.stroke()
    }

    const maxDegree = Math.max(1, ...nodes.map((n) => n.degree))
    nodes.forEach((node, i) => {
      const p = positions[i]
      if (!p) return
      const isLit = lit === null || lit.has(i)
      ctx.globalAlpha = isLit ? 1 : 0.15
      ctx.fillStyle = communityColor(node.community, dark)
      const radius = 2.5 + (node.degree / maxDegree) * 6
      ctx.beginPath()
      ctx.arc(sx(p), sy(p), radius, 0, Math.PI * 2)
      ctx.fill()
    })

    // Label only the hovered node. Labelling more turns 150 nodes into soup.
    if (active !== null) {
      const p = positions[active]
      const node = nodes[active]
      if (p && node) {
        ctx.globalAlpha = 1
        // Canvas has no stylesheet, so the token has to be read rather than
        // referenced. Still the token — not a family invented here.
        const sans = readVar(canvas, "--font-family-sans", "system-ui, sans-serif")
        ctx.font = `600 12px ${sans}`
        const text = node.label
        const metrics = ctx.measureText(text)
        const bx = Math.min(Math.max(sx(p) + 10, 4), width - metrics.width - 12)
        const by = Math.min(Math.max(sy(p) - 10, 16), height - 8)
        ctx.fillStyle = readVar(canvas, "--color-surface", dark ? "#1c1c1c" : "#fff")
        ctx.fillRect(bx - 4, by - 12, metrics.width + 8, 17)
        ctx.strokeStyle = edgeColor
        ctx.globalAlpha = 0.9
        ctx.strokeRect(bx - 4, by - 12, metrics.width + 8, 17)
        ctx.globalAlpha = 1
        ctx.fillStyle = labelColor
        ctx.fillText(text, bx, by)
      }
    }
    ctx.globalAlpha = 1
  }, [nodes, edges, neighbours])

  // Layout, then paint. Re-runs only when the payload itself changes.
  useEffect(() => {
    if (nodes.length === 0) return
    const positions = seededLayout(nodes.length, hashSeed(appName))
    positionsRef.current = positions

    const step = () => {
      // Repulsion. O(n²), which at the 150-node cap is ~11k pair checks a
      // tick — cheaper than the machinery a quadtree would need here.
      for (let i = 0; i < positions.length; i++) {
        const a = positions[i]
        if (!a) continue
        for (let j = i + 1; j < positions.length; j++) {
          const b = positions[j]
          if (!b) continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distSq = dx * dx + dy * dy || 0.01
          const force = 220 / distSq
          const dist = Math.sqrt(distSq)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.vx += fx
          a.vy += fy
          b.vx -= fx
          b.vy -= fy
        }
      }
      // Springs along edges.
      for (const [ai, bi] of edges) {
        const a = positions[ai]
        const b = positions[bi]
        if (!a || !b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
        const force = (dist - 34) * 0.012
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      }
      // Pull to centre so disconnected islands do not drift off.
      for (const p of positions) {
        p.vx -= p.x * 0.0016
        p.vy -= p.y * 0.0016
        p.vx *= 0.86
        p.vy *= 0.86
        p.x += p.vx
        p.y += p.vy
      }
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      for (let i = 0; i < TICKS; i++) step()
      draw()
      return
    }

    let frame = 0
    let raf = 0
    const tick = () => {
      // Several steps per frame: the settling reads as a quick unfurl rather
      // than a slow crawl, without running the whole layout before first paint.
      for (let i = 0; i < 4; i++) step()
      draw()
      frame += 4
      if (frame < TICKS) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [nodes, edges, appName, draw])

  // Redraw on hover and on resize without re-running the layout.
  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * ratio
      canvas.height = canvas.clientHeight * ratio
      const ctx = canvas.getContext("2d")
      ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [draw])

  const onMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const positions = positionsRef.current
    if (!canvas || positions.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const mx = event.clientX - rect.left
    const my = event.clientY - rect.top

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const p of positions) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
    const pad = 26
    const spanX = Math.max(maxX - minX, 1)
    const spanY = Math.max(maxY - minY, 1)
    const scale = Math.min((rect.width - pad * 2) / spanX, (rect.height - pad * 2) / spanY)
    const offsetX = (rect.width - spanX * scale) / 2 - minX * scale
    const offsetY = (rect.height - spanY * scale) / 2 - minY * scale

    let best: number | null = null
    let bestDist = 14 * 14
    positions.forEach((p, i) => {
      const dx = p.x * scale + offsetX - mx
      const dy = p.y * scale + offsetY - my
      const d = dx * dx + dy * dy
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setHovered(best)
  }

  if (nodes.length === 0) {
    return null
  }

  return (
    <section className="help-box">
      <h2>Knowledge graph</h2>
      <p className="field-hint">
        Built from this app's own source by graphify, on its last merge to main. Colours are
        detected communities; bigger dots are more connected. Hover a dot to see what it is.
      </p>

      <div className="graph-stats">
        <div>
          <dt>Nodes</dt>
          <dd>{summary.nodes.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Edges</dt>
          <dd>{summary.edges.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Communities</dt>
          <dd>{summary.communities.toLocaleString()}</dd>
        </div>
      </div>

      {/* The canvas is an overview, not the only route to the information:
          every fact it shows is also in the counts above and the hub list
          below, both of which need no pointer. */}
      <canvas
        ref={canvasRef}
        className="graph-canvas"
        style={{ height: HEIGHT }}
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
        aria-label={`Knowledge graph overview for ${appName}: ${summary.nodes} nodes across ${summary.communities} communities`}
        role="img"
      />

      {summary.sample.nodes.length < summary.nodes && (
        <p className="field-hint">
          Showing the {summary.sample.nodes.length} most-connected of{" "}
          {summary.nodes.toLocaleString()} nodes. The full graph lives in the repo at{" "}
          <code>graphify-out/graph.html</code>.
        </p>
      )}

      {summary.hubs.length > 0 && (
        <>
          <h3 className="graph-hubs-heading">Most connected</h3>
          <div className="badges">
            {summary.hubs.map((hub) => (
              <span key={hub.label} className="badge" title={`${hub.degree} connections`}>
                {hub.label} <span className="graph-hub-degree">{hub.degree}</span>
              </span>
            ))}
          </div>
        </>
      )}

      <p className="field-hint graph-repo-hint">
        Clone the repo and run <code>pnpm graph:open</code> for the full interactive graph, or{" "}
        <a href={repoUrl} target="_blank" rel="noreferrer">
          browse the source ↗
        </a>
        .
      </p>
    </section>
  )
}
