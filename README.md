# werft-marketplace

Personal app registry and dashboard.

Scaffolded from werft-template. Conventions and hard rules live in AGENTS.md.

```bash
pnpm install
pnpm dev
```

Environment lives in `apps/web/.env.local`; `apps/web/.env.example` lists what
is needed. Run `pnpm hash-password` to set the operator password.
<!-- wiring verification -->
Live at https://werft-marketplace.vercel.app — open /new in the app to scaffold more apps.