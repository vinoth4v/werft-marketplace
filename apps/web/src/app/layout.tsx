import { color } from "@werft/tokens"
import type { Metadata, Viewport } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
// Tokens first: globals.css consumes the custom properties this defines.
import "@werft/tokens/tokens.css"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Werft",
    template: "%s · Werft",
  },
  description: "Your personal app registry and dashboard.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: color.bg.light },
    { media: "(prefers-color-scheme: dark)", color: color.bg.dark },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            <span aria-hidden="true">⚓</span> Werft
          </Link>
          <span className="brand-tagline">your apps, one place</span>
        </header>
        {children}
        <footer className="site-footer">
          <p>
            Apps register themselves here when they merge to <code>main</code> · health is checked
            nightly · <Link href="/new">scaffold a new app</Link>
          </p>
        </footer>
      </body>
    </html>
  )
}
