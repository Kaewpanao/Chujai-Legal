/**
 * Chujai Legal — AI document generation route.
 * POST /api/ai/generate
 * Generates a legal document from a template + merge fields. Uses DeepSeek to
 * polish the draft when available, otherwise returns the merged template.
 */

import { generate, parseJsonFromText } from "@/lib/ai/deepseek";
import { buildDocumentPrompt, buildSystemPrompt } from "@/lib/ai/prompt";
import { checkGuardrails, serializeViolations } from "@/lib/legal/guardrails-check";
import {
  generateDocument,
  DOCUMENT_DISCLAIMER,
} from "@/lib/documents/merge";
import { error, json, readJson } from "@/lib/api";

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
      const check = checkGuardrails(result.content);

      const title = parsed?.title ?? merged.title;
      const body = parsed?.body ?? merged.body;
      const safeBody = ensureDisclaimer(body);

      return json({
        templateId,
        title,
        body: safeBody,
        disclaimer: DOCUMENT_DISCLAIMER,
        unresolved: merged.unresolved,
        aiGenerated: !check.blocked,
        guardrails: serializeViolations(check.violations),
      });
    }
  } catch {
    // Fall through to merged template.
  }

  return json({
    templateId,
    title: merged.title,
    body: merged.body,
    disclaimer: DOCUMENT_DISCLAIMER,
    unresolved: merged.unresolved,
    aiGenerated: false,
    guardrails: [],
  });
}

/** Ensure the legal disclaimer is present (guardrail: always-disclaimer). */
function ensureDisclaimer(body: string): string {
  if (body.includes("ไม่ใช่คำปรึกษาทางกฎหมาย")) return body;
  return `${body}\n\n---\n\n${DOCUMENT_DISCLAIMER}`;
}
