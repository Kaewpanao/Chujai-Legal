/**
 * Chujai Legal — register route.
 * POST /api/auth/register
 * Creates an account via Supabase; falls back to a demo session when
 * Supabase is not configured.
 */

import { createServerClient } from "@/lib/supabase/server";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
}

export async function POST(req: Request) {
  const body = await readJson<RegisterBody>(req);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const name = body?.name?.trim();

  if (!email || !password) {
    return error("กรุณากรอกอีเมลและรหัสผ่าน", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error("รูปแบบอีเมลไม่ถูกต้อง", 400);
  }
  if (password.length < 8) {
    return error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", 400);
  }

  const client = createServerClient();

  if (client.configured) {
    const { data, error: signupError } = await client.signUp(
      email,
      password,
      { name: name || email.split("@")[0] },
    );
    if (signupError || !data) {
      return error(signupError?.message ?? "ไม่สามารถสมัครสมาชิกได้", 400);
    }
    return json({ user: data.user, session: data }, { status: 201 });
  }

  // Mock fallback.
  const user = {
    id: `usr_${email.replace(/[^a-z0-9]/g, "")}`,
    email,
    role: "consumer",
    name: name || email.split("@")[0],
  };
  return json({ user, mock: true }, { status: 201 });
}
