/**
 * Chujai Legal — AI diagnosis route.
 * POST /api/ai/diagnose
 * Accepts case answers, runs DeepSeek (with guardrail checks) or falls back to
 * a deterministic, source-cited analysis built from the legal data layer.
 */

import { generate, parseJsonFromText } from "@/lib/ai/deepseek";
import { buildDiagnosisPrompt, buildSystemPrompt } from "@/lib/ai/prompt";
import { checkGuardrails, serializeViolations } from "@/lib/legal/guardrails-check";
import { getCategoryById, type LegalCategory } from "@/lib/legal/categories";
import { sourceForCategory } from "@/lib/legal/sources";
import { FEAR_LEVEL_MAP, type FearLevelId } from "@/lib/legal/fear-calibration";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DiagnoseBody {
  answers?: Record<string, string>;
  categoryId?: string;
  subProblem?: string;
  fearLevel?: string;
}

interface DiagnosisSource {
  lawName: string;
  ref: string;
  label: string;
}

interface DiagnosisOutput {
  summary: string;
  category: string;
  rights: string[];
  options: string[];
  urgentSteps: string[];
  sources: DiagnosisSource[];
}

export async function POST(req: Request) {
  const body = await readJson<DiagnoseBody>(req);
  if (!body) return error("คำขอไม่ถูกต้อง (ต้องเป็น JSON)", 400);

  const category: LegalCategory | undefined =
    (body.categoryId && getCategoryById(body.categoryId)) || undefined;
  const fearLevelId = normalizeFearLevel(body.fearLevel);

  if (!category) {
    return error("ไม่พบหมวดกฎหมายที่ระบุ กรุณาระบุ categoryId ให้ถูกต้อง", 400);
  }

  const answers = body.answers ?? {};

  // 1) Try DeepSeek.
  try {
    const system = buildSystemPrompt(fearLevelId);
    const source = sourceForCategory(category.id);
    const sourceContext = source
      ? `${source.name} (${source.shortName}) · หมวด: ${source.domain}\n` +
        source.sections.map((s) => `- ${s.ref} — ${s.label}`).join("\n")
      : "";
    const user = buildDiagnosisPrompt({
      categoryTitle: category.title,
      subProblem: body.subProblem,
      answers,
      fearLevelId,
      sourceContext,
    });
    const result = await generate(system, user);

    if (result.live && result.content) {
      const parsed = parseJsonFromText<DiagnosisOutput>(result.content);
      if (parsed) {
        const check = checkGuardrails(result.content);
        if (check.blocked) {
          return json(
            {
              ...fallbackDiagnosis(category, answers, fearLevelId),
              aiGenerated: false,
              guardrails: serializeViolations(check.violations),
              note: "AI ตอบโดยฝ่าฝืนกฎความปลอดภัย จึงแสดงผลจากฐานข้อมูลแทน",
            },
            { status: 200 },
          );
        }
        return json({
          ...parsed,
          aiGenerated: true,
          model: result.model,
          guardrails: serializeViolations(check.violations),
        });
      }
    }
  } catch {
    // Fall through to deterministic analysis.
  }

  return json(fallbackDiagnosis(category, answers, fearLevelId));
}

/** Deterministic, source-cited fallback built from the legal data layer. */
function fallbackDiagnosis(
  category: LegalCategory,
  answers: Record<string, string>,
  fearLevelId?: FearLevelId,
): DiagnosisOutput & { aiGenerated: boolean; guardrails: unknown[] } {
  const source = sourceForCategory(category.id);
  const fear = fearLevelId ? FEAR_LEVEL_MAP[fearLevelId] : undefined;

  const rights = source
    ? source.sections.map(
        (s) => `คุณมีสิทธิ${s.label} ตาม${source.shortName} ${s.ref}`,
      )
    : ["คุณมีสิทธิได้รับความคุ้มครองตามกฎหมายที่เกี่ยวข้อง"];

  if (rights.length === 0) {
    rights.push("คุณมีสิทธิได้รับความคุ้มครองตามกฎหมายที่เกี่ยวข้อง");
  }

  const options = [
    "เก็บรวบรวมหลักฐานที่เกี่ยวข้องให้ครบถ้วน (ภาพ ข้อความ เอกสาร)",
    "เริ่มวินิจฉัยปัญหาแบบละเอียดทีละขั้นกับ AI ของเรา",
    "ปรึกษาทนายความผู้เชี่ยวชาญ หากต้องการความมั่นใจเพิ่มเติม",
  ];

  const urgentSteps =
    fearLevelId === "panic" || fearLevelId === "urgent"
      ? [
          "หากมีอันตรายต่อชีวิต/ร่างกาย ให้โทร 191 หรือไปโรงพยาบาลที่ใกล้ที่สุดก่อน",
          "แจ้งเจ้าหน้าที่หรือคนใกล้ชิดให้รับทราบสถานการณ์",
        ]
      : [];

  const sources: DiagnosisSource[] = source
    ? source.sections.slice(0, 3).map((s) => ({
        lawName: source.name,
        ref: s.ref,
        label: s.label,
      }))
    : [];

  const empathy = fear ? `${fear.emoji} เราเข้าใจความรู้สึกของคุณนะ ` : "เราเข้าใจนะ ";
  const summary =
    `${empathy}เรื่อง “${category.title}” เป็นเรื่องที่หลายคนกังวลใจ ` +
    `จากข้อมูลที่คุณเล่า เรื่องนี้เข้าข่ายหมวด “${category.title}” ซึ่งกฎหมายไทยให้ความคุ้มครองคุณอยู่ ` +
    `คุณมีสิทธิและทางเลือก เราช่วยอธิบายให้คุณตัดสินใจเองได้`;

  return {
    summary,
    category: category.title,
    rights,
    options,
    urgentSteps,
    sources,
    aiGenerated: false,
    guardrails: [],
  };
}

function normalizeFearLevel(value?: string): FearLevelId | undefined {
  if (!value) return undefined;
  return value in FEAR_LEVEL_MAP ? (value as FearLevelId) : undefined;
}
