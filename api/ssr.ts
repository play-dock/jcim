// Vercel Node.js Serverless Function adapter for TanStack Start.
//
// We import the prebuilt worker bundle (produced by `vite build`).
// It default-exports a Web Fetch handler with `.fetch(request, env, ctx)`.
//
// Edge runtime is NOT used because the Cloudflare/TanStack build emits
// node:stream / node:stream/web imports that Vercel Edge does not support.
// Node runtime supports those natively.
// @ts-ignore - resolved at build time after `vite build` runs.
import handler from "../dist/server/index.js";

export const config = {
  runtime: "nodejs",
};

export default async function (request: Request): Promise<Response> {
  return (handler as { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> })
    .fetch(request, {}, {});
}
