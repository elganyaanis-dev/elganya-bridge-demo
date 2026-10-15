# Elganya Bridge Demo

UI demo for the Elganya Bolt Bridge contract. **No GitHub command is executed.**

## Deploy on Vercel

### Option A — one-click (manual)

1. Go to https://vercel.com/new
2. Import `elganya-bridge-demo`
3. Framework is auto-detected (Vite)
4. Click **Deploy** — no env vars needed

### Option B — auto-deploy from GitHub Actions

1. Create a Vercel token at https://vercel.com/account/tokens
2. Get your Vercel Org ID and Project ID from `vercel link` (or project settings)
3. In GitHub repo, add secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. Push to `main` → `.github/workflows/deploy.yml` deploys automatically

## Local

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm test         # 18 Vitest cases
```

## What it does

- Detects ```bridge blocks pasted from any AI chat
- Validates JSON + allowed commands + safe paths
- Shows a detailed preview (simulated before/after)
- **Never executes anything on GitHub** — real execution requires a secured backend (Supabase Edge Function).

## What it does NOT do

- No GitHub API calls
- No token storage
- No Bolt / Termux / Horus connection
- No direct AI generation

These require a backend (Supabase Edge Functions) and secrets — out of scope for a static Vercel demo.
