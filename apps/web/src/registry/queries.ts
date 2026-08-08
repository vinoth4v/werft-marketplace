import { desc, eq } from "drizzle-orm"
import { db } from "@/db/client"
import { type WerftAppRow, werftApp } from "@/db/schema"

/** Newest deploys first — the apps you touched most recently surface first. */
export async function listApps(): Promise<WerftAppRow[]> {
  return db().select().from(werftApp).orderBy(desc(werftApp.lastDeployAt))
}

export async function getAppByName(name: string): Promise<WerftAppRow | null> {
  const [row] = await db().select().from(werftApp).where(eq(werftApp.name, name)).limit(1)
  return row ?? null
}

/** Every distinct tag across every app, for the filter row. Alphabetical. */
export function allTags(apps: WerftAppRow[]): string[] {
  return [...new Set(apps.flatMap((app) => app.tags))].sort()
}
