import type { ReactNode } from "react"
import { MODEL_GROUPS, MODEL_LABELS } from "@/lib/models"

/**
 * The model field, shared by the two forms that dispatch work: creating an app
 * and asking an existing one to change.
 *
 * Shared because it drifted once already — the list lived in one module while
 * one of the two server actions carried its own hand-written copy of the same
 * names, so a model added in one place was accepted by the form and silently
 * dropped on the way out. One component, one list, one allowlist.
 *
 * The hint differs per form, so it is passed in rather than guessed at here.
 */
export function ModelPicker({ hint }: { hint: ReactNode }) {
  return (
    <div className="form-field">
      <label htmlFor="model">Model</label>
      <select id="model" name="model" defaultValue="" className="model-select">
        {MODEL_GROUPS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.models.map((model) => (
              <option key={model} value={model}>
                {MODEL_LABELS[model]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="field-hint">{hint}</p>
    </div>
  )
}
