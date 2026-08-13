/**
 * Chujai Legal — single case route.
 * GET    /api/cases/[caseId]   → fetch one case
 * PUT    /api/cases/[caseId]   → update a case
 * DELETE /api/cases/[caseId]   → delete a case
 */

import { createServerClient } from "@/lib/supabase/server";
import { error, json, readJson } from "@/lib/api";
import * as store from "@/lib/mock/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CaseParams {
  params: Promise<{ caseId: string }>;
}

export async function GET(_req: Request, { params }: CaseParams) {
  const { caseId } = await params;
  const client = createServerClient();

  if (client.configured) {
    const { data, error: dbError } = await client.selectOne("cases", caseId);
    if (dbError) return error(dbError.message, 500);
    if (!data) return error("ไม่พบเคสที่ระบุ", 404);
    return json({ case: data });
  }

  const record = store.getCase(caseId);
  if (!record) return error("ไม่พบเคสที่ระบุ", 404);
  return json({ case: record, mock: true });
}

export async function PUT(req: Request, { params }: CaseParams) {
  const { caseId } = await params;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return error("คำขอไม่ถูกต้อง (ต้องเป็น JSON)", 400);

  const client = createServerClient();
  if (client.configured) {
    const { data, error: dbError } = await client.update(
      "cases",
      { id: caseId },
      body,
    );
    if (dbError) return error(dbError.message, 500);
    if (!data || data.length === 0) return error("ไม่พบเคสที่ระบุ", 404);
    return json({ case: data[0] });
  }

  const record = store.updateCase(caseId, body as Partial<store.MockCase>);
  if (!record) return error("ไม่พบเคสที่ระบุ", 404);
  return json({ case: record, mock: true });
}

export async function DELETE(_req: Request, { params }: CaseParams) {
  const { caseId } = await params;
  const client = createServerClient();

  if (client.configured) {
    const { error: dbError } = await client.delete("cases", { id: caseId });
    if (dbError) return error(dbError.message, 500);
    return json({ deleted: true });
  }

  const ok = store.deleteCase(caseId);
  if (!ok) return error("ไม่พบเคสที่ระบุ", 404);
  return json({ deleted: true, mock: true });
}
