/**
 * Chujai Legal — tax optimization route.
 * POST /api/tax/optimize
 * Suggests additional tax deductions (DeepSeek when available, otherwise a
 * deterministic rule-based list from `lib/legal/tax.ts`). Cites ประมวลรัษฎากร.
 */

import { generate, parseJsonFromText } from "@/lib/ai/deepseek";
import { buildSystemPrompt, buildTaxOptimizePrompt } from "@/lib/ai/prompt";
import { checkGuardrails, serializeViolations } from "@/lib/legal/guardrails-check";
import { TAX_DEDUCTIONS } from "@/lib/legal/tax";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OptimizeBody {
  income?: number;
  deductions?: string[];
}

interface Suggestion {
  id: string;
  label: string;
  reason: string;
  estimatedSaving: number;
}

export async function POST(req: Request) {
  const body = await readJson<OptimizeBody>(req);
  const income = body?.income;

  if (typeof income !== "number" || income < 0) {
    return error("กรุณาระบุรายได้ (income) เป็นตัวเลขที่มากกว่าหรือเท่ากับ 0", 400);
  }

  const selected = new Set(body?.deductions ?? []);
  const available = TAX_DEDUCTIONS.filter((d) => !selected.has(d.id));

  // Try DeepSeek.
  try {
    const system = buildSystemPrompt();
    const user = buildTaxOptimizePrompt({
      income,
      selected: [...selected],
      available,
    });
    const result = await generate(system, user);
    if (result.live && result.content) {
      const parsed = parseJsonFromText<{
        suggestions?: Suggestion[];
        summary?: string;
      }>(result.content);
      if (parsed?.suggestions) {
        const check = checkGuardrails(result.content);
        return json({
          suggestions: parsed.suggestions,
          summary: parsed.summary ?? "",
          aiGenerated: !check.blocked,
          guardrails: serializeViolations(check.violations),
          source: {
            lawName: "ประมวลรัษฎากร",
            ref: "มาตรา 47",
            label: "การหักลดหย่อน",
          },
        });
      }
    }
  } catch {
    // Fall through.
  }

  // Deterministic fallback: recommend unselected deductions, ordered by value.
  const suggestions: Suggestion[] = available
    .map((d) => ({
      id: d.id,
      label: d.label,
      reason: d.note ?? `ลดหย่อนได้สูงสุด ${d.max.toLocaleString("th-TH")} บาท`,
      estimatedSaving: Math.round(d.max * 0.15),
    }))
    .sort((a, b) => b.estimatedSaving - a.estimatedSaving)
    .slice(0, 5);

  const summary =
    suggestions.length > 0
      ? "เราพบรายการลดหย่อนที่คุณยังไม่ได้ใช้ การใช้ครบจะช่วยลดภาระภาษีได้ — ตัวเลขเป็นเพียงประมาณการเพื่อการศึกษาเท่านั้น"
      : "คุณใช้รายการลดหย่อนครบแล้ว เยี่ยมมาก";

  return json({
    suggestions,
    summary,
    aiGenerated: false,
    guardrails: [],
    source: {
      lawName: "ประมวลรัษฎากร",
      ref: "มาตรา 47",
      label: "การหักลดหย่อน",
    },
  });
}
