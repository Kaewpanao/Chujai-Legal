/**
 * Chujai Legal — LINE Login route.
 * GET /api/auth/line
 *   - No `code` param  → redirects to the LINE Login authorization URL.
 *   - With `code`      → exchanges the code for a LINE profile and returns a
 *                        session (or a mock session when LINE is not configured).
 */

import { NextResponse } from "next/server";

import {
  buildLineAuthUrl,
  exchangeLineCode,
  isLineLoginConfigured,
} from "@/lib/line/notify";
import { json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Step 1: redirect to LINE for authorization.
  if (!code) {
    if (!isLineLoginConfigured()) {
      // Mock: expose the URL that would be used, and a demo callback code.
      return json({
        mock: true,
        authUrl: buildLineAuthUrl(state ?? "chujai-demo"),
        message: "LINE Login ยังไม่พร้อมใช้งาน (ยังไม่ได้ตั้ง LINE_CHANNEL_ID/SECRET)",
      });
    }
    return NextResponse.redirect(
      buildLineAuthUrl(state ?? "chujai"),
    );
  }

  // Step 2: exchange code for profile.
  const { profile, error: exchangeError } = await exchangeLineCode(code);

  if (exchangeError || !profile) {
    return json(
      { error: exchangeError ?? "LINE Login ล้มเหลว", lineConfigured: isLineLoginConfigured() },
      { status: 502 },
    );
  }

  return json({
    user: {
      id: `line_${profile.userId}`,
      email: profile.email ?? "",
      name: profile.displayName,
      pictureUrl: profile.pictureUrl,
      role: "consumer",
      provider: "line",
    },
    session: {
      accessToken: `line-access-${profile.userId}`,
      refreshToken: `line-refresh-${profile.userId}`,
      expiresIn: 3600,
    },
    mock: false,
  });
}
