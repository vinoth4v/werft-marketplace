"use client"

import { useState } from "react"

/**
 * Visual theme picker — each option is a miniature rendering of the theme,
 * not a name in a dropdown. The swatches use each theme's real token values
 * (the same hex the token package emits), so what you pick is what you get.
 * A hidden input carries the choice into the form's server action.
 */

type ThemePreview = {
  key: string
  label: string
  note: string
  bg: string
  surface: string
  fg: string
  muted: string
  accent: string
  serif?: boolean
}

// Mirrors @werft/tokens' themes.ts light-scheme values. Duplicated because a
// swatch is presentation, not the source of truth — the token package builds
// the real stylesheet; a drift here is cosmetic, caught by eye, not a bug in
// any shipped app.
const THEMES: ThemePreview[] = [
  {
    key: "werft",
    label: "Werft",
    note: "Quiet zinc, workshop blue",
    bg: "#fafafa",
    surface: "#ffffff",
    fg: "#18181b",
    muted: "#52525b",
    accent: "#2563eb",
  },
  {
    key: "madras",
    label: "Madras",
    note: "Warm paper, terracotta, serif — from SruthiScribe",
    bg: "#faf7f2",
    surface: "#ffffff",
    fg: "#2d2a26",
    muted: "#8a7f72",
    accent: "#b0421f",
    serif: true,
  },
  {
    key: "deck",
    label: "Deck",
    note: "Stage black, signal green — from LoopDeck",
    bg: "#0b0d12",
    surface: "#171b23",
    fg: "#e8eaee",
    muted: "#8b93a1",
    accent: "#4ade80",
  },
  {
    key: "nordlicht",
    label: "Nordlicht",
    note: "Graphite night, aurora violet",
    bg: "#121016",
    surface: "#1b1822",
    fg: "#efedf5",
    muted: "#9b96ad",
    accent: "#a18aff",
  },
  {
    key: "tinte",
    label: "Tinte",
    note: "Editorial ink on paper, near-monochrome",
    bg: "#ffffff",
    surface: "#f7f6f3",
    fg: "#141414",
    muted: "#5c5a54",
    accent: "#1a1a1a",
  },
]

export function ThemePicker({ name }: { name: string }) {
  const [selected, setSelected] = useState("werft")

  return (
    <fieldset className="theme-picker">
      <legend>Theme</legend>
      <p className="field-hint">
        Pick a look — the whole app is styled from it. Every card is the real theme, not a swatch of
        one colour.
      </p>
      <input type="hidden" name={name} value={selected} />
      <div className="theme-grid">
        {THEMES.map((theme) => (
          <button
            type="button"
            key={theme.key}
            className={selected === theme.key ? "theme-card selected" : "theme-card"}
            aria-pressed={selected === theme.key}
            onClick={() => setSelected(theme.key)}
            title={theme.note}
          >
            <span
              className="theme-preview"
              style={{ background: theme.bg, borderColor: theme.surface }}
              aria-hidden="true"
            >
              <span
                className="theme-preview-title"
                style={{ color: theme.fg, fontFamily: theme.serif ? "Georgia, serif" : "inherit" }}
              >
                Aa
              </span>
              <span className="theme-preview-line" style={{ background: theme.muted }} />
              <span className="theme-preview-line short" style={{ background: theme.muted }} />
              <span className="theme-preview-button" style={{ background: theme.accent }} />
            </span>
            <span className="theme-card-label">{theme.label}</span>
            <span className="theme-card-note">{theme.note}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
