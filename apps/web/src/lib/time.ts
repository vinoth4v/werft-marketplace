/**
 * Time rendering for the registry UI.
 *
 * Deliberately hand-rolled rather than toLocaleString(): these run in server
 * components, where "the server's locale and timezone" is an accident of
 * where Vercel scheduled the lambda — the same row could render differently
 * between deploys. Deterministic UTC output plus a relative phrase is both
 * stable and more useful ("2 hours ago" answers the actual question).
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const UNITS = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
] as const

/** "just now", "1 minute ago", "3 hours ago", "2 days ago", … */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)

  // Under a minute — and anything in the future, which at this scale is
  // clock skew between machines, not information.
  if (seconds < 60) return "just now"

  for (const [unit, unitSeconds] of UNITS) {
    if (seconds >= unitSeconds) {
      const count = Math.floor(seconds / unitSeconds)
      return `${count} ${unit}${count === 1 ? "" : "s"} ago`
    }
  }
  return "just now"
}

/** "8 Aug 2026, 13:11 UTC" — the same string on every server, every render. */
export function formatUtc(date: Date): string {
  const day = date.getUTCDate()
  const month = MONTHS[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`
}
