/**
 * Chujai Legal — cases list/create route.
 * GET  /api/cases       → list cases (Supabase or mock store)
 * POST /api/cases       → create a case (Supabase or mock store)
 */

import { createServerClient } from "@/lib/supabase/server";
import { bearerToken, error, json, readJson } from "@/lib/api";
import { getCategoryById } from "@/lib/legal/categories";
import * as store from "@/lib/mock/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateCaseBody {
  title?: string;
  categoryId?: string;
  fearLevel?: string;
  answers?: Record<string, string>;
}

export async function GET(req: Request) {
  const userId = bearerToken(req);
  const client = createServerClient();

  if (client.configured) {
    const { data, error: dbError } = await client.select("cases", {
      select: "*",
      order: "created_at.desc",
    });
    if (dbError) return error(dbError.message, 500);
    return json({ cases: data ?? [] });
  }

  return json({ cases: store.listCases(userId ?? undefined), mock: true });
}

export async function POST(req: Request) {
  const body = await readJson<CreateCaseBody>(req);
  const title = body?.title?.trim();
  const categoryId = body?.categoryId?.trim();

  if (!title || !categoryId) {
    return error("กรุณาระบุชื่อเรื่อง (title) และหมวด (categoryId)", 400);
  }

  const category = getCategoryById(categoryId);
  const categoryTitle = category?.title ?? categoryId;
  const fearLevel = body?.fearLevel ?? "concerned";
  const answers = body?.answers ?? {};
  const userId = bearerToken(req) ?? "usr_anonymous";

  const client = createServerClient();
  if (client.configured) {
    const { data, error: dbError } = await client.insert("cases", {
      title,
      category_id: categoryId,
      category_title: categoryTitle,
      fear_level: fearLevel,
      answers,
      user_id: userId,
      status: "draft",
    });
    if (dbError) return error(dbError.message, 500);
    return json({ case: data?.[0] ?? null }, { status: 201 });
  }

  const record = store.createCase({
    title,
    categoryId,
    categoryTitle,
    fearLevel,
    answers,
    userId,
  });
  return json({ case: record, mock: true }, { status: 201 });
}
