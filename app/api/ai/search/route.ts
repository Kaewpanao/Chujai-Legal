/**
 * Chujai Legal — AI legal search route.
 * POST /api/ai/search
 * Accepts a free-text query, calls DeepSeek (with guardrails) or falls back to
 * the keyword matcher + sourced answer in `lib/legal/search.ts`.
 */

import { generate, parseJsonFromText } from "@/lib/ai/deepseek";
import { buildSearchPrompt, buildSystemPrompt } from "@/lib/ai/prompt";
import { checkGuardrails, serializeViolations } from "@/lib/legal/guardrails-check";
import { buildSearchResult } from "@/lib/legal/search";
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

export async function POST(req: Request) {
  const body = await readJson<SearchBody>(req);
  const query = body?.query?.trim();
  if (!query) return error("กรุณาระบุคำค้นหา (query)", 400);

  try {
    const system = buildSystemPrompt();
    const user = buildSearchPrompt(query);
    const result = await generate(system, user);

    if (result.live && result.content) {
      const parsed = parseJsonFromText<SearchOutput>(result.content);
      if (parsed?.answer) {
        const check = checkGuardrails(result.content);
        return json({
          ...parsed,
          matched: true,
          aiGenerated: !check.blocked,
          guardrails: serializeViolations(check.violations),
        });
      }
    }
  } catch {
    // Fall through to deterministic answer.
  }

  const fallback = buildSearchResult(query);
  return json({
    ...fallback,
    aiGenerated: false,
    guardrails: [],
  });
}
