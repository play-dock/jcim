# Vercel Deployment Guide

This project is a TanStack Start app originally built for Cloudflare Workers. The same Web Fetch handler is reused on Vercel Edge runtime.

## One-time setup

1. Push this repo to GitHub (Lovable → `+` menu → GitHub → Connect project).
2. On [vercel.com/new](https://vercel.com/new) → **Import** the repo.
3. **Framework Preset**: `Other`
4. **Build Command**: `vite build` (already in `vercel.json`)
5. **Output Directory**: `dist/client` (already in `vercel.json`)
6. **Install Command**: `bun install` (or leave default)

## Environment Variables (Vercel → Project → Settings → Environment Variables)

Required for build (client) **and** runtime (server):

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://suzvuoglldozyoguglmu.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (anon key from Lovable Cloud) |
| `VITE_SUPABASE_PROJECT_ID` | `suzvuoglldozyoguglmu` |
| `SUPABASE_URL` | same as above |
| `SUPABASE_PUBLISHABLE_KEY` | same anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (Lovable Cloud → Backend → Settings) |

Apply to all three environments: Production, Preview, Development.

## How it works

- `vite build` produces `dist/client/` (static assets) + `dist/server/index.js` (Web Fetch handler).
- `api/ssr.ts` is a Vercel Edge Function that imports the built handler and forwards every request to it.
- `vercel.json` rewrites all paths to `/api/ssr` so the edge function handles SSR + server functions + API routes.

## Custom Domain

Vercel → Project → Settings → Domains → Add.

## Notes

- Cloudflare Workers config (`wrangler.jsonc`) is kept so Lovable preview keeps working. Removing it will break the in-editor preview.
- Lovable's `jcim.lovable.app` publish URL also keeps working alongside Vercel.
