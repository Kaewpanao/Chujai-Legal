/**
 * Chujai Legal — login route.
 * POST /api/auth/login
 * Email/password login via Supabase; falls back to a demo session when
 * Supabase is not configured (graceful mock for local dev).
 */

import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase/server";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(req: Request) {
  const body = await readJson<LoginBody>(req);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return error("กรุณากรอกอีเมลและรหัสผ่าน", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error("รูปแบบอีเมลไม่ถูกต้อง", 400);
  }

  const client = createServerClient();

  if (client.configured) {
    const { data, error: authError } = await client.signInWithPassword(
      email,
      password,
    );
    if (authError || !data) {
      return error(
        authError?.message ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        authError?.status === 401 ? 401 : 401,
      );
    }
    const response = json({ user: data.user, session: data });
    setSessionCookies(response, data.accessToken, data.refreshToken);
    return response;
  }

  // Mock fallback (no Supabase configured).
  const mockUser = mockLoginUser(email);
  const response = json({
    user: mockUser,
    session: {
      accessToken: `mock-access-${Buffer.from(email).toString("base64")}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresIn: 3600,
      user: mockUser,
    },
    mock: true,
  });
  return response;
}

function setSessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set("chujai-access-token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  response.cookies.set("chujai-refresh-token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

function mockLoginUser(email: string) {
  return {
    id: `usr_${email.replace(/[^a-z0-9]/g, "")}`,
    email,
    role: "consumer",
    name: email.split("@")[0] || "ผู้ใช้ชูใจ",
  };
}
