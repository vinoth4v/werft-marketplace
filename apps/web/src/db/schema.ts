import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

/**
 * Append-only record of things worth knowing after the fact: sign-ins,
 * failed sign-ins, and whatever the app built on this template adds.
 *
 * A single-operator app has no admin console, so this table is the only
 * place a past event is recoverable from.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    kind: text("kind").notNull(),
    actor: text("actor"),
    detail: text("detail"),
  },
  (table) => [index("audit_log_at_idx").on(table.at)],
)

export type AuditLogRow = typeof auditLog.$inferSelect
export type NewAuditLogRow = typeof auditLog.$inferInsert

/**
 * The Werft registry: one row per app scaffolded from werft-template.
 *
 * Populated by CI only, on merge to main — see /api/registry/upsert. Never
 * hand-edited: a row that drifts from its app's own werft.json is a bug in
 * the upsert path, not something to patch here.
 */
export const werftApp = pgTable(
  "werft_app",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Matches werft.json's name — also the GitHub repo, Neon project and
    // Vercel project name, so it's unique by construction, not by convention.
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
    stack: jsonb("stack").$type<string[]>().notNull(),
    url: text("url").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull(),
    status: text("status").notNull(),
    private: boolean("private").notNull(),
    // Derived, not read from werft.json: every scaffolded app's repo is
    // named identically to the app, under the one account this registry
    // serves — recorded once here rather than recomputed by every reader.
    repoUrl: text("repo_url").notNull(),
    lastDeployAt: timestamp("last_deploy_at", { withTimezone: true }).notNull().defaultNow(),
    health: text("health").notNull().default("unknown"),
    healthCheckedAt: timestamp("health_checked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("werft_app_status_idx").on(table.status)],
)

export type WerftAppRow = typeof werftApp.$inferSelect
export type NewWerftAppRow = typeof werftApp.$inferInsert
