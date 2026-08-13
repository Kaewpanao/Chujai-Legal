/**
 * Chujai Legal — Supabase server client.
 * Uses server-only env vars. Prefers the service-role key for privileged
 * operations, falling back to the anon key. Server-side only — do not import
 * from client components (it reads non-public `SUPABASE_*` env vars).
 */

import { SupabaseRestClient } from "./rest";

export function createServerClient(): SupabaseRestClient {
  const url = process.env.SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
  return new SupabaseRestClient({ url, key });
}

/** Shared singleton for server-side usage. */
export const supabaseServer: SupabaseRestClient = createServerClient();
