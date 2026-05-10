// Vercel Edge Function adapter for TanStack Start.
//
// We import the already-built worker bundle (produced by `vite build` via the
// Cloudflare/TanStack Start plugin). It default-exports a Web Fetch handler
// with a `.fetch(request, env, ctx)` method that is API-compatible with both
// Cloudflare Workers and Vercel Edge runtime.
//
// Importing the prebuilt bundle (instead of src/server.ts directly) avoids
// re-bundling the SSR manifest outside Vite — Vercel just ships the existing
// artifact.
// @ts-ignore - resolved at build time after `vite build` runs.
import handler from "../dist/server/index.js";

export const config = {
  runtime: "edge",
};

export default async function (request: Request): Promise<Response> {
  return (handler as { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> })
    .fetch(request, {}, {});
}
