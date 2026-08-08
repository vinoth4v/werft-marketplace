"use client"

import { useRef, useState } from "react"

/**
 * The build plan: paste it, or load it from a file.
 *
 * A one-line input was the wrong shape for this. What actually gets written is
 * a plan — headings, bullets, code fences — and it becomes the body of the
 * @claude issue that builds the app, so it is the most important field on the
 * form rather than an afterthought.
 *
 * The file is read in the browser and dropped into the textarea. Nothing is
 * uploaded and nothing is stored: the plan travels as an ordinary form field,
 * so there is no attachment to keep, expire, or leak, and you can still edit
 * what the file contained before submitting.
 */

const MAX_CHARS = 20_000

export function BuildPlanField({ name }: { name: string }) {
  const [plan, setPlan] = useState("")
  const [loadedFrom, setLoadedFrom] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  async function loadFile(file: File): Promise<void> {
    setProblem(null)
    const text = await file.text().catch(() => null)
    if (text === null) {
      setProblem("that file could not be read")
      return
    }
    if (text.length > MAX_CHARS) {
      setProblem(
        `that file is ${text.length.toLocaleString()} characters; the limit is ${MAX_CHARS.toLocaleString()}. Trim it, or keep the plan high-level and let Claude ask.`,
      )
      return
    }
    setPlan(text)
    setLoadedFrom(file.name)
  }

  return (
    <div className="form-field">
      <label htmlFor={name}>Build plan</label>
      <p className="field-hint">
        What should this app be? Paste the whole plan — markdown is fine. It becomes an @claude
        issue in the new repo, so building starts on its own. Leave it empty to get the bare
        template.
      </p>

      <textarea
        id={name}
        name={name}
        rows={12}
        maxLength={MAX_CHARS}
        value={plan}
        onChange={(event) => {
          setPlan(event.target.value)
          setLoadedFrom(null)
        }}
        placeholder={"## What it does\n\n…\n\n## Screens\n\n…\n\n## Data model\n\n…"}
      />

      <div className="plan-tools">
        <button type="button" onClick={() => fileInput.current?.click()}>
          Load from file…
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".md,.markdown,.txt,.json,text/plain,text/markdown"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void loadFile(file)
            // Cleared so picking the same file twice still fires a change.
            event.target.value = ""
          }}
        />
        <span className="field-hint">
          {problem ? (
            <strong>{problem}</strong>
          ) : loadedFrom ? (
            `loaded ${loadedFrom} — edit it below before submitting if you like`
          ) : (
            `${plan.length.toLocaleString()} / ${MAX_CHARS.toLocaleString()} characters`
          )}
        </span>
      </div>
    </div>
  )
}
