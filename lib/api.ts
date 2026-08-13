/**
 * Chujai Legal — shared API route helpers.
 * Consistent JSON responses and body parsing across all route handlers.
 */

import { NextResponse } from "next/server";

export function json(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, { status: init?.status ?? 200 });
}

export function error(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function unauthorized(message = "กรุณาเข้าสู่ระบบก่อน") {
  return error(message, 401);
}

/** Parse a JSON request body, returning null on malformed input. */
export async function readJson<T = Record<string, unknown>>(
  req: Request,
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/** Read a bearer token from the Authorization header. */
export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
