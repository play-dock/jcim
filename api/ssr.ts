// Vercel Edge Function adapter for TanStack Start.
// Reuses the same Web Fetch handler in src/server.ts that Cloudflare Workers
// uses, so a single SSR entry powers both runtimes.
//
// Vercel Edge runtime exposes globalThis.Request / Response and is API-
// compatible with Cloudflare Workers for our use case (no node:* APIs at
// request time).
import handler from "../src/server";

export const config = {
  runtime: "edge",
};

export default async function (request: Request): Promise<Response> {
  return handler.fetch(request, {}, {});
}
