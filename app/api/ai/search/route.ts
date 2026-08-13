/**
 * Chujai Legal — AI legal search route.
 * POST /api/ai/search
 * Accepts a free-text query, calls DeepSeek (grounded in the legal source
 * registry + matched category) or falls back to the deterministic sourced
 * answer in `lib/legal/search.ts`.
 */

import { generate, parseJsonFromText } from "@/lib/ai/deepseek";
import { buildSearchPrompt, buildSystemPrompt } from "@/lib/ai/prompt";
import { checkGuardrails, serializeViolations } from "@/lib/legal/guardrails-check";
import { buildSearchResult, matchCategory } from "@/lib/legal/search";
import { LEGAL_SOURCES, sourceForCategory } from "@/lib/legal/sources";
import { getCategoryById } from "@/lib/legal/categories";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchBody {
  query?: string;
}

interface SearchOutput {
  answer: string;
  sources: { lawName: string; ref: string; label: string }[];
  nextSteps: string[];
  categoryId?: string;
}

/** Detects an evasive reply that fails to actually answer the query. */
function isEvasive(answer: string): boolean {
  return /(ไม่ทราบว่า|ขอรายละเอียด|เล่า.{0,20}เพิ่มเติม|ระบุ.{0,20}ชัดเจน|กรุณาเล่า|ช่วยเล่า)/i.test(
    answer,
  );
}

/** Every section ref that appears in the registered source registry. */
function knownRefs(): Set<string> {
  const refs = new Set<string>();
  for (const src of LEGAL_SOURCES) {
    for (const s of src.sections) refs.add(s.ref);
  }
  return refs;
}

export async function POST(req: Request) {
  const body = await readJson<SearchBody>(req);
  const query = body?.query?.trim();
  if (!query) return error("กรุณาระบุคำค้นหา (query)", 400);

  const match = matchCategory(query);
  const category = match ? getCategoryById(match.categoryId) : undefined;
  const source = match ? sourceForCategory(match.categoryId) : undefined;
  const refs = knownRefs();

  // Build a rich grounding block: category + sub-problems + real source sections.
  let context = "";
  if (category) {
    context += `หมวดกฎหมายที่ตรง: ${category.title} (${category.id})\n`;
    context += `คำอธิบายหมวด: ${category.description}\n`;
    if (category.subProblems.length) {
      context += `ปัญหาย่อยที่พบบ่อย: ${category.subProblems.map((sp) => sp.title).join(" / ")}\n`;
    }
  }
  if (source) {
    context += `\nกฎหมายที่เกี่ยวข้อง (ต้องใช้อ้างอิงเท่านั้น):\n${source.name} (${source.shortName})\n`;
    context += source.sections.map((s) => `- ${s.ref} — ${s.label}`).join("\n");
  }

  try {
    const system = buildSystemPrompt();
    const user = buildSearchPrompt(query, context);
    const result = await generate(system, user);

    if (result.live && result.content) {
      const parsed = parseJsonFromText<SearchOutput>(result.content);
      if (parsed?.answer && !isEvasive(parsed.answer)) {
        const check = checkGuardrails(result.content);
        // Reject only citations that reference a section outside our registry.
        const fabricated = parsed.sources?.some((s) => s.ref && !refs.has(s.ref));
        if (!check.blocked && !fabricated) {
          return json({
            ...parsed,
            matched: true,
            aiGenerated: true,
            model: result.model,
            guardrails: serializeViolations(check.violations),
          });
        }
      }
    }
  } catch {
    // Fall through to deterministic answer.
  }

  const fallback = buildSearchResult(query);
  return json({
    ...fallback,
    aiGenerated: false,
    model: "data-layer",
    guardrails: [],
  });
}
