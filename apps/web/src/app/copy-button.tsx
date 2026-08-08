"use client"

import { useState } from "react"

/**
 * Copies a command to the clipboard and says so — pressing a button and
 * wondering whether anything happened is the small UX failure that makes
 * instructions pages feel broken.
 */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="copy-button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard denied (permissions, insecure context): the command is
          // right there to select by hand — no error state worth designing.
        }
      }}
    >
      <span aria-live="polite">{copied ? "Copied ✓" : "Copy"}</span>
    </button>
  )
}
