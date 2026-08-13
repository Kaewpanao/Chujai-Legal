/**
 * Chujai Legal — document generation route.
 * POST /api/documents/generate
 * Merges a template + fields, optionally polishes with DeepSeek, persists the
 * document (Supabase or mock store), and returns the saved document.
 */

import { generate, parseJsonFromText } from "@/lib/ai/deepseek";
import { buildDocumentPrompt, buildSystemPrompt } from "@/lib/ai/prompt";
import {
  generateDocument,
  DOCUMENT_DISCLAIMER,
} from "@/lib/documents/merge";
import { createServerClient } from "@/lib/supabase/server";
import { bearerToken, error, json, readJson } from "@/lib/api";
import * as store from "@/lib/mock/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GenerateBody {
  templateId?: string;
  fields?: Record<string, string>;
}

export async function POST(req: Request) {
  const body = await readJson<GenerateBody>(req);
  const templateId = body?.templateId?.trim();
  if (!templateId) return error("กรุณาระบุ templateId", 400);

  const fields = body?.fields ?? {};
  const merged = generateDocument(templateId, fields);
  if (!merged) return error(`ไม่พบแม่แบบเอกสาร "${templateId}"`, 404);

  let title = merged.title;
  let docBody = merged.body;
  let aiGenerated = false;

  // Optional AI polish (graceful — falls back to the merged template).
  try {
    const system = buildSystemPrompt();
    const user = buildDocumentPrompt({
      templateTitle: merged.title,
      mergedText: merged.body,
    });
    const result = await generate(system, user);
    if (result.live && result.content) {
      const parsed = parseJsonFromText<{ title?: string; body?: string }>(
        result.content,
      );
      if (parsed?.body) {
        title = parsed.title ?? merged.title;
        docBody = ensureDisclaimer(parsed.body);
        aiGenerated = true;
      }
    }
  } catch {
    // Keep merged output.
  }

  const userId = bearerToken(req) ?? "usr_anonymous";

  const client = createServerClient();
  if (client.configured) {
    const { data, error: dbError } = await client.insert("documents", {
      template_id: templateId,
      title,
      body: docBody,
      user_id: userId,
    });
    if (dbError) return error(dbError.message, 500);
    const doc = data?.[0];
    return json(
      {
        document: doc ?? null,
        disclaimer: DOCUMENT_DISCLAIMER,
        unresolved: merged.unresolved,
        aiGenerated,
      },
      { status: 201 },
    );
  }

  const record = store.createDocument({
    templateId,
    title,
    body: docBody,
    userId,
  });
  return json(
    {
      document: record,
      disclaimer: DOCUMENT_DISCLAIMER,
      unresolved: merged.unresolved,
      aiGenerated,
      mock: true,
    },
    { status: 201 },
  );
}

function ensureDisclaimer(body: string): string {
  if (body.includes("ไม่ใช่คำปรึกษาทางกฎหมาย")) return body;
  return `${body}\n\n---\n\n${DOCUMENT_DISCLAIMER}`;
}
