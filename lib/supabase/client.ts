/**
 * Chujai Legal — Supabase browser client.
 * Uses `NEXT_PUBLIC_*` env vars (inlined into the client bundle). Safe to
 * import from client components. Returns a `SupabaseRestClient` instance.
 */

import { SupabaseRestClient } from "./rest";

export function createBrowserClient(): SupabaseRestClient {
  return new SupabaseRestClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  });
}

/** Shared singleton for client-side usage. */
export const supabaseBrowser: SupabaseRestClient = createBrowserClient();
