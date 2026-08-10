# Deploying RationQ (Frontend on Cloudflare Pages + Backend on Render) — 100% Free

This splits the app into two pieces that talk over HTTPS:
- **Frontend** (React, built by Vite) → Cloudflare Pages
- **Backend** (Express API + Gemini + Supabase + RSS crawler) → Render free web service

No paid tier is required for either.

## 1. Push this project to GitHub
Both Cloudflare Pages and Render deploy from a GitHub repo.

## 2. Deploy the backend on Render
1. Go to https://render.com → New → **Blueprint**.
2. Connect this repo. Render will detect `render.yaml` at the project root and create a
   `rationq-api` free web service automatically.
3. In the Render dashboard → your service → **Environment**, fill in the secret values
   (these were left blank in render.yaml on purpose — never commit real keys to git):
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy. Once it's live, copy the service URL shown at the top of the Render page —
   it looks like `https://rationq-api.onrender.com`.
5. (Optional but recommended) Add that same URL + `/api/health` to
   [UptimeRobot](https://uptimerobot.com) (free) with a 5-minute check interval, so
   Render's free tier doesn't spin the service down between visits.

## 3. Deploy the frontend on Cloudflare Pages
1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → select this repo.
2. Build settings:
   | Setting | Value |
   |---|---|
   | Framework preset | Vite |
   | Build command | `npm run build:client` |
   | Build output directory | `dist` |
3. Before the first deploy, add an environment variable (Settings → Environment
   variables → Production):
   - `VITE_API_BASE_URL` = the Render URL from step 2.4, e.g. `https://rationq-api.onrender.com`
     (no trailing slash)
4. Deploy. Cloudflare gives you a URL like `https://rationq.pages.dev` immediately;
   attach your custom domain afterwards from the same project's **Custom domains** tab.

## 4. Lock down CORS (do this after both are live)
Right now `render.yaml` sets `CORS_ORIGIN=*` so nothing blocks you while wiring things up.
Once you know your final Cloudflare Pages URL (or custom domain), go back to Render →
Environment → set `CORS_ORIGIN` to that exact URL, e.g.:
```
CORS_ORIGIN=https://rationq.pages.dev
```
(or your custom domain, once attached). Redeploy the Render service for it to take effect.

## 5. Supabase
Already covered separately — see `supabase/schema.sql`. Both the Render backend and your
local dev server read the same Supabase project via `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`,
so articles created in production persist exactly the same way as in local dev.

## Local development is unaffected
`npm run dev` still runs the combined server (frontend + backend on one port) exactly as
before — `VITE_API_BASE_URL` stays empty locally, so requests remain same-origin and none
of this split matters until you actually deploy.
