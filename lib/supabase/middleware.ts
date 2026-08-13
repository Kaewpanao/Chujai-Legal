/**
 * Chujai Legal — Supabase auth middleware helper.
 *
 * To enable session refresh for authenticated routes, drop a `middleware.ts`
 * at the project root that calls `updateSession(request)` and re-exports it.
 *
 *   import { updateSession } from "@/lib/supabase/middleware";
 *   export async function middleware(request) { return updateSession(request); }
 *   export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
 *
 * The helper is deliberately safe: when Supabase is not configured it returns
 * the request unchanged, so the app works fully offline/mock.
 */

import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "./server";

export async function updateSession(request: NextRequest) {
  const client = createServerClient();
  if (!client.configured) return NextResponse.next({ request });

  const accessToken = request.cookies.get("chujai-access-token")?.value;
  const refreshToken = request.cookies.get("chujai-refresh-token")?.value;

  // Without a session cookie there is nothing to refresh.
  if (!accessToken || !refreshToken) {
    return NextResponse.next({ request });
  }

  // Best-effort: verify the current access token. If it's still valid we do
  // nothing; if it's stale we could refresh — refresh flow is kept minimal and
  // non-fatal here (any auth error just passes through unauthenticated).
  const { data, error } = await client.getUser(accessToken);

  let response = NextResponse.next({ request });
  if (error && refreshToken) {
    // NOTE: full refresh requires POST /auth/v1/token?grant_type=refresh_token.
    // Kept as a no-op fallback for now — the route-level auth checks are the
    // authoritative gate. We clear stale cookies so clients retry login.
    response.cookies.delete("chujai-access-token");
    response.cookies.delete("chujai-refresh-token");
  } else if (data) {
    // Refresh the access-token cookie expiry to keep the session alive.
    response.cookies.set("chujai-access-token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}
