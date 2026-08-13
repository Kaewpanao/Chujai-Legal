/**
 * Chujai Legal — single document route.
 * GET /api/documents/[docId] → fetch one generated document.
 */

import { createServerClient } from "@/lib/supabase/server";
import { error, json } from "@/lib/api";
import * as store from "@/lib/mock/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DocParams {
  params: Promise<{ docId: string }>;
}

export async function GET(_req: Request, { params }: DocParams) {
  const { docId } = await params;
  const client = createServerClient();

  if (client.configured) {
    const { data, error: dbError } = await client.selectOne("documents", docId);
    if (dbError) return error(dbError.message, 500);
    if (!data) return error("ไม่พบเอกสารที่ระบุ", 404);
    return json({ document: data });
  }

  const record = store.getDocument(docId);
  if (!record) return error("ไม่พบเอกสารที่ระบุ", 404);
  return json({ document: record, mock: true });
}
