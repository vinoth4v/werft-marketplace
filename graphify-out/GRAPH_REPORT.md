# Graph Report - werft-marketplace  (2026-08-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 515 nodes · 799 edges · 30 communities (23 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc8df26a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scaffold.ts
- app/page.tsx
- devDependencies
- tokens/src/index.ts
- compilerOptions
- create-werft-app/src/index.ts
- dependencies
- [name]/page.tsx
- new/page.tsx
- biome.json
- compilerOptions
- scripts
- create-werft-app/tsconfig.json
- neon-preview-branch.mjs
- create-werft-app/package.json
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

## God Nodes (most connected - your core abstractions)
1. `scaffold()` - 27 edges
2. `compilerOptions` - 18 edges
3. `db()` - 13 edges
4. `scripts` - 12 edges
5. `compilerOptions` - 9 edges
6. `scripts` - 9 edges
7. `Ledger` - 8 edges
8. `Runner` - 7 edges
9. `!**/.next` - 7 edges
10. `ExecOptions` - 6 edges

## Surprising Connections (you probably didn't know these)
- `include` --extends--> `!**/next-env.d.ts`  [EXTRACTED]
  apps/web/tsconfig.json → biome.json
- `exclude` --extends--> `!**/node_modules`  [EXTRACTED]
  apps/web/tsconfig.json → biome.json
- `scaffold()` --calls--> `renderWerftJson()`  [EXTRACTED]
  packages/create-werft-app/src/scaffold.ts → packages/create-werft-app/src/werft-json.ts
- `DELETE()` --calls--> `db()`  [EXTRACTED]
  apps/web/src/app/api/registry/apps/[name]/route.ts → apps/web/src/db/client.ts
- `GET()` --calls--> `listApps()`  [EXTRACTED]
  apps/web/src/app/api/registry/apps/route.ts → apps/web/src/registry/queries.ts

## Import Cycles
- None detected.

## Communities (30 total, 7 thin omitted)

### Community 0 - "scaffold.ts"
Cohesion: 0.08
Nodes (40): exec(), ExecOptions, ExecResult, quote(), createNeonProject(), deleteNeonProject(), neonDeleteCommand(), NeonKeyCheck (+32 more)

### Community 1 - "app/page.tsx"
Cohesion: 0.07
Nodes (38): signOutAction(), DELETE(), GET(), GET(), ping(), POST(), AppCard(), AppGrid() (+30 more)

### Community 2 - "devDependencies"
Cohesion: 0.05
Nodes (42): devDependencies, drizzle-kit, @playwright/test, @types/node, @types/react, @types/react-dom, typescript, vitest (+34 more)

### Community 3 - "tokens/src/index.ts"
Cohesion: 0.12
Nodes (31): metadata, viewport, outputPath, packageRoot, theme, customPropertyNames(), declarations(), groupsFor() (+23 more)

### Community 4 - "compilerOptions"
Cohesion: 0.06
Nodes (29): nextConfig, signInAction(), dynamic, metadata, compilerOptions, allowImportingTsExtensions, allowJs, incremental (+21 more)

### Community 5 - "create-werft-app/src/index.ts"
Cohesion: 0.10
Nodes (25): BOOLEAN_FLAGS, DEFAULT_TEMPLATE, helpText(), NEGATIVE_FLAGS, Options, parseArgs(), ParseResult, parse() (+17 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (30): dependencies, drizzle-orm, @neondatabase/serverless, next, next-auth, react, react-dom, @werft/tokens (+22 more)

### Community 7 - "[name]/page.tsx"
Cohesion: 0.09
Nodes (27): mergePullRequestAction(), requestFeatureAction(), retireAppAction(), AppDetailPage(), dynamic, generateMetadata(), HEALTH_LABEL, healthLabel() (+19 more)

### Community 8 - "new/page.tsx"
Cohesion: 0.12
Nodes (15): CopyButton(), ModelPicker(), scaffoldAction(), BuildPlanField(), dynamic, metadata, ThemePicker(), ThemePreview (+7 more)

### Community 9 - "biome.json"
Cohesion: 0.08
Nodes (23): source, assist, actions, files, formatter, enabled, indentStyle, indentWidth (+15 more)

### Community 10 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit (+12 more)

### Community 11 - "scripts"
Cohesion: 0.11
Nodes (18): engines, node, name, packageManager, private, scripts, build, create-app (+10 more)

### Community 12 - "create-werft-app/tsconfig.json"
Cohesion: 0.11
Nodes (16): ../../tsconfig.base.json, compilerOptions, allowImportingTsExtensions, types, extends, include, node, src/**/*.ts (+8 more)

### Community 13 - "neon-preview-branch.mjs"
Cohesion: 0.30
Nodes (13): connectionUri(), create(), createBranch(), del(), deleteVercelPreviewEnv(), env, findBranch(), findVercelEnv() (+5 more)

### Community 14 - "create-werft-app/package.json"
Cohesion: 0.15
Nodes (12): bin, create-werft-app, exports, files, src, name, private, scripts (+4 more)

### Community 15 - "reap-stale-preview-branches.mjs"
Cohesion: 0.30
Nodes (10): deleteVercelEnvForBranch(), env, githubFetch(), headBranchOf(), main(), neonFetch(), openPrNumbers(), prNumberFromBranchName() (+2 more)

### Community 16 - "password.ts"
Cohesion: 0.38
Nodes (6): COST, hashPassword(), isHex(), maxmemFor(), normalize(), verifyPassword()

### Community 17 - "wait-for-preview.mjs"
Cohesion: 0.80
Nodes (4): findDeployment(), main(), readyState(), vercelUrl()

## Knowledge Gaps
- **197 isolated node(s):** `NeonKeyCheck`, `NeonProject`, `ScaffoldFailure`, `ScaffoldSuccess`, `StepFailure` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `!**/.next` connect `compilerOptions` to `new/page.tsx`, `app/page.tsx`, `tokens/src/index.ts`, `[name]/page.tsx`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `includes` connect `compilerOptions` to `biome.json`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `files` connect `biome.json` to `compilerOptions`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `scaffold()` (e.g. with `.entries()` and `.record()`) actually correct?**
  _`scaffold()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `NeonKeyCheck`, `NeonProject`, `ScaffoldFailure` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scaffold.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08106219426974144 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06688311688311688 - nodes in this community are weakly interconnected._