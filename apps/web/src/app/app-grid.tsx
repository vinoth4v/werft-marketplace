"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { WerftAppRow } from "@/db/schema"

type Props = {
  apps: WerftAppRow[]
  tags: string[]
}

const HEALTH_LABEL: Record<string, string> = {
  healthy: "Online",
  unhealthy: "Not responding",
  unknown: "Not checked yet",
}

/** A health value this UI has never heard of must degrade to words, not to
 * an unlabeled dot with an undefined tooltip. */
function healthLabel(health: string): string {
  return HEALTH_LABEL[health] ?? `Unrecognised state: ${health}`
}

/**
 * Everything below is client-side filtering over data already fetched on the
 * server. A single operator's own apps is a small, known list — there is no
 * reason to round-trip a search query to the database.
 */
export function AppGrid({ apps, tags }: Props) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return apps.filter((app) => {
      const matchesQuery =
        needle === "" ||
        app.name.toLowerCase().includes(needle) ||
        (app.title ?? "").toLowerCase().includes(needle) ||
        app.description.toLowerCase().includes(needle)
      const matchesTag = activeTag === null || app.tags.includes(activeTag)
      return matchesQuery && matchesTag
    })
  }, [apps, query, activeTag])

  if (apps.length === 0) {
    return (
      <div className="empty-state">
        <p>
          <strong>You haven't shipped anything yet.</strong>
        </p>
        <p>
          One command scaffolds a deployed, authenticated app that registers itself here on its
          first merge — nothing to add manually.
        </p>
        <Link href="/new" className="launch-button">
          Scaffold your first app
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="toolbar">
        <label htmlFor="search" className="sr-only">
          Search your apps
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search by name or description…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {tags.length > 0 && (
        <fieldset className="tag-filters">
          <legend className="sr-only">Filter by category</legend>
          <button
            type="button"
            className={activeTag === null ? "tag-filter active" : "tag-filter"}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={activeTag === tag ? "tag-filter active" : "tag-filter"}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </fieldset>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Nothing matches. Try a different search, or show all categories.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setActiveTag(null)
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="app-grid">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}

function AppCard({ app }: { app: WerftAppRow }) {
  return (
    <article className="app-card">
      <Link href={`/apps/${app.name}`} className="app-card-link">
        <div className="app-card-header">
          <h2>{app.title ?? app.name}</h2>
          <span className={`health-dot health-${app.health}`} title={healthLabel(app.health)}>
            <span className="sr-only">{healthLabel(app.health)}</span>
          </span>
        </div>
        <p className="app-card-description">{app.description}</p>
        {/* What it is, not what it is built with. The tech stack is still on
            the app's own page, where someone asking that question goes. */}
        <div className="badges">
          {app.tags.map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
      </Link>
      {app.url ? (
        <a href={app.url} target="_blank" rel="noreferrer" className="launch-button">
          Launch ↗
        </a>
      ) : (
        <span className="launch-button launch-button-disabled" title="No production URL recorded">
          Not deployed yet
        </span>
      )}
    </article>
  )
}
