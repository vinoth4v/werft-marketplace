# Graph Report - werft-marketplace  (2026-08-19)

## Corpus Check
- 115 files · ~47,889 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 620 nodes · 898 edges · 42 communities (30 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ea1d4f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scaffold.ts
- app/page.tsx
- create-werft-app/package.json
- tokens/src/index.ts
- compilerOptions
- create-werft-app/src/index.ts
- dependencies
- [name]/page.tsx
- new/page.tsx
- biome.json
- compilerOptions
- scripts
- graph-summary.ts
- neon-preview-branch.mjs
- What You Must Do When Invoked
- reap-stale-preview-branches.mjs
- password.ts
- wait-for-preview.mjs
- vercel.json
- cli.test.ts
- next-env.d.ts
- migrate.ts
- 0000_audit_log.sql
- 0001_werft_app.sql
- { GET, POST }
- AGENTS.md
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- CLAUDE.md
- extraction-spec.md
- "werft_app"

## God Nodes (most connected - your core abstractions)
1. `scaffold()` - 27 edges
2. `compilerOptions` - 18 edges
3. `scripts` - 16 edges
4. `db()` - 13 edges
5. `What You Must Do When Invoked` - 12 edges
6. `/graphify` - 10 edges
7. `compilerOptions` - 9 edges
8. `scripts` - 9 edges
9. `graphify reference: extra exports and benchmark` - 8 edges
10. `Ledger` - 8 edges

## Surprising Connections (you probably didn't know these)
- `summarised()` --calls--> `summarise()`  [EXTRACTED]
  apps/web/src/registry/graph-payload.test.ts → scripts/registry-payload.mjs
- `generateMetadata()` --calls--> `getAppByName()`  [EXTRACTED]
  apps/web/src/app/apps/[name]/page.tsx → apps/web/src/registry/queries.ts
- `scaffold()` --calls--> `renderWerftJson()`  [EXTRACTED]
  packages/create-werft-app/src/scaffold.ts → packages/create-werft-app/src/werft-json.ts
- `DELETE()` --calls--> `db()`  [EXTRACTED]
  apps/web/src/app/api/registry/apps/[name]/route.ts → apps/web/src/db/client.ts
- `GET()` --calls--> `listApps()`  [EXTRACTED]
  apps/web/src/app/api/registry/apps/route.ts → apps/web/src/registry/queries.ts

## Import Cycles
- None detected.

## Communities (42 total, 12 thin omitted)

### Community 0 - "scaffold.ts"
Cohesion: 0.07
Nodes (41): exec(), ExecOptions, ExecResult, quote(), Ledger, createNeonProject(), deleteNeonProject(), neonDeleteCommand() (+33 more)

### Community 1 - "app/page.tsx"
Cohesion: 0.07
Nodes (38): signOutAction(), DELETE(), GET(), GET(), ping(), POST(), AppCard(), AppGrid() (+30 more)

### Community 2 - "create-werft-app/package.json"
Cohesion: 0.05
Nodes (37): @types/node, @types/node, bin, create-werft-app, devDependencies, @types/node, typescript, vitest (+29 more)

### Community 3 - "tokens/src/index.ts"
Cohesion: 0.12
Nodes (31): metadata, viewport, outputPath, packageRoot, theme, customPropertyNames(), declarations(), groupsFor() (+23 more)

### Community 4 - "compilerOptions"
Cohesion: 0.05
Nodes (35): compilerOptions, allowImportingTsExtensions, allowJs, incremental, jsx, lib, paths, plugins (+27 more)

### Community 5 - "create-werft-app/src/index.ts"
Cohesion: 0.12
Nodes (24): BOOLEAN_FLAGS, DEFAULT_TEMPLATE, helpText(), NEGATIVE_FLAGS, Options, parseArgs(), ParseResult, parse() (+16 more)

### Community 6 - "dependencies"
Cohesion: 0.05
Nodes (42): dependencies, drizzle-orm, @neondatabase/serverless, next, next-auth, react, react-dom, @werft/tokens (+34 more)

### Community 7 - "[name]/page.tsx"
Cohesion: 0.11
Nodes (23): mergePullRequestAction(), requestFeatureAction(), retireAppAction(), AppDetailPage(), dynamic, generateMetadata(), HEALTH_LABEL, healthLabel() (+15 more)

### Community 8 - "new/page.tsx"
Cohesion: 0.10
Nodes (19): CopyButton(), ModelPicker(), scaffoldAction(), BuildPlanField(), dynamic, metadata, ThemePicker(), ThemePreview (+11 more)

### Community 9 - "biome.json"
Cohesion: 0.05
Nodes (34): nextConfig, signInAction(), dynamic, metadata, source, assist, actions, files (+26 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+12 more)

### Community 11 - "scripts"
Cohesion: 0.07
Nodes (27): @biomejs/biome, devDependencies, @biomejs/biome, typescript, engines, node, name, packageManager (+19 more)

### Community 12 - "graph-summary.ts"
Cohesion: 0.12
Nodes (21): communityColor(), GraphPanel(), hashSeed(), Placed, Props, readVar(), seededLayout(), summarised() (+13 more)

### Community 13 - "neon-preview-branch.mjs"
Cohesion: 0.30
Nodes (13): connectionUri(), create(), createBranch(), del(), deleteVercelPreviewEnv(), env, findBranch(), findVercelEnv() (+5 more)

### Community 14 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 15 - "reap-stale-preview-branches.mjs"
Cohesion: 0.30
Nodes (10): deleteVercelEnvForBranch(), env, githubFetch(), headBranchOf(), main(), neonFetch(), openPrNumbers(), prNumberFromBranchName() (+2 more)

### Community 16 - "password.ts"
Cohesion: 0.38
Nodes (6): COST, hashPassword(), isHex(), maxmemFor(), normalize(), verifyPassword()

### Community 17 - "wait-for-preview.mjs"
Cohesion: 0.80
Nodes (4): findDeployment(), main(), readyState(), vercelUrl()

### Community 30 - "AGENTS.md"
Cohesion: 0.22
Nodes (7): Blessed dependencies, Commands, graphify, Never do this, Phase 2 repository secrets, This app specifically: the Werft registry and marketplace, What this template can do

### Community 31 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 32 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 33 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 34 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 35 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **266 isolated node(s):** `graphify`, `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)`, `Step 1 - Ensure graphify is installed` (+261 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `!**/.next` connect `biome.json` to `new/page.tsx`, `app/page.tsx`, `tokens/src/index.ts`, `[name]/page.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `scaffold()` (e.g. with `.entries()` and `.record()`) actually correct?**
  _`scaffold()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `graphify`, `Usage`, `What graphify is for` to the rest of the system?**
  _266 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scaffold.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06610169491525424 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06688311688311688 - nodes in this community are weakly interconnected._
- **Should `create-werft-app/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `tokens/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11740890688259109 - nodes in this community are weakly interconnected._