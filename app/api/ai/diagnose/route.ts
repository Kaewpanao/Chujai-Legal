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

interface DiagnosisStep {
  step: string;
  title: string;
  detail: string;
  emoji?: string;
}

interface DiagnosisOutput {
  empathy?: string;
  summary: string;
  category: string;
  stepByStep?: DiagnosisStep[];
  reassurance?: string;
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
      socialProof: category.socialProof,
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
          ...normalizeDiagnosis(parsed, category, fearLevelId),
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

/** Coerce an AI-parsed object into a safe, fully-populated diagnosis shape. */
function normalizeDiagnosis(
  parsed: DiagnosisOutput,
  category: LegalCategory,
  fearLevelId?: FearLevelId,
): Required<Pick<DiagnosisOutput, "empathy" | "stepByStep" | "reassurance">> &
  DiagnosisOutput {
  const fallback = fallbackDiagnosis(category, {}, fearLevelId);

  return {
    ...parsed,
    empathy: parsed.empathy?.trim() || fallback.empathy,
    summary: parsed.summary?.trim() || fallback.summary,
    category: parsed.category || category.title,
    stepByStep: Array.isArray(parsed.stepByStep) && parsed.stepByStep.length
      ? parsed.stepByStep
      : fallback.stepByStep,
    reassurance: parsed.reassurance?.trim() || fallback.reassurance,
    rights: Array.isArray(parsed.rights) && parsed.rights.length
      ? parsed.rights
      : fallback.rights,
    options: Array.isArray(parsed.options) ? parsed.options : fallback.options,
    urgentSteps: Array.isArray(parsed.urgentSteps)
      ? parsed.urgentSteps
      : fallback.urgentSteps,
    sources: Array.isArray(parsed.sources) && parsed.sources.length
      ? parsed.sources
      : fallback.sources,
  };
}

/** Deterministic, source-cited fallback built from the legal data layer. */
function fallbackDiagnosis(
  category: LegalCategory,
  answers: Record<string, string>,
  fearLevelId?: FearLevelId,
): DiagnosisOutput & {
  empathy: string;
  stepByStep: DiagnosisStep[];
  reassurance: string;
  aiGenerated: boolean;
  guardrails: unknown[];
} {
  const source = sourceForCategory(category.id);
  const fear = fearLevelId ? FEAR_LEVEL_MAP[fearLevelId] : undefined;

  const rights = source
    ? source.sections.map(
        (s) =>
          `คุณมีสิทธิ${s.label} — หมายความว่ากฎหมาย${source.shortName} ${s.ref} คุ้มครองคุณในเรื่องนี้โดยตรง`,
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

  const empathy = fear
    ? `${fear.emoji} เราเข้าใจความรู้สึกของคุณนะ ไม่เป็นไร เรื่องนี้คุณไม่ได้ทำผิด และคุณไม่ได้อยู่คนเดียว`
    : "เราเข้าใจนะ ไม่เป็นไร เรื่องแบบนี้คุณไม่ได้ทำผิด และคุณไม่ได้อยู่คนเดียว";

  const summary =
    `เรื่อง “${category.title}” เป็นเรื่องที่หลายคนกังวลใจ ` +
    `จากข้อมูลที่คุณเล่า เรื่องนี้เข้าข่ายหมวด “${category.title}” ซึ่งกฎหมายไทยให้ความคุ้มครองคุณอยู่ ` +
    `คุณมีสิทธิและทางเลือก เราจะพาคุณไปทีละขั้นจนมั่นใจ`;

  const stepByStep: DiagnosisStep[] = [
    {
      step: "1",
      title: "เก็บหลักฐานให้ครบก่อน",
      detail:
        "แคปหน้าจอ เก็บข้อความและเอกสารทุกอย่างไว้ เพราะหลักฐานอาจถูกลบหรือแก้ไขได้ การเก็บไว้ก่อนทำให้คุณมีหลักต่อรองที่มั่นคง",
      emoji: "📸",
    },
    {
      step: "2",
      title: "เขียนไทม์ไลน์เหตุการณ์",
      detail:
        "จดว่าเกิดอะไรขึ้น เมื่อไหร่ ใครเกี่ยวข้องบ้าง ไล่ตามลำดับเวลา เพราะเวลาไปยื่นเรื่องหรือเล่าให้ทนายฟัง ข้อมูลครบจะช่วยได้มาก",
      emoji: "📝",
    },
    {
      step: "3",
      title: "เลือกเส้นทางที่สบายใจ",
      detail:
        "คุณทำเองได้ หรือจะปรึกษาทนาย หรือไกล่เกลี่ยกันก็ได้ — ไม่มีทางไหนผิด เลือกทางที่คุณไหวที่สุด",
      emoji: "🧭",
    },
  ];

  const reassurance =
    `ชูใจเคยช่วยคนที่เจอเรื่องแบบนี้มาแล้วประมาณ ${category.socialProof.toLocaleString("th-TH")} คน ` +
    `คุณจัดการเองได้แน่นอน เราอยู่ตรงนี้ช่วยคุณทุกขั้นตอน 💪`;

  return {
    empathy,
    summary,
    category: category.title,
    stepByStep,
    reassurance,
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
