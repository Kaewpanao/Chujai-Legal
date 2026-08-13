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
import { LEGAL_SOURCES, sourcesForCategory } from "@/lib/legal/sources";
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
  return /(ไม่ทราบว่า|ขอรายละเอียด|เล่า.{0,20}เพิ่มเติม|ระบุ.{0,20}ชัดเจน|กรุณาเล่า|ช่วยเล่า|กรุณาให้ข้อมูลเพิ่มเติม|โปรดระบุเพิ่มเติม)/i.test(
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

/**
 * True when a citation references a section number that isn't in the registry
 * (i.e. fabricated). Law-name-only citations and refs whose section number
 * matches a known section are accepted — this tolerates the model prefixing
 * the law name (e.g. "ป.พ.พ. มาตรา 420") without letting invented sections
 * through.
 */
function isFabricatedRef(ref: string, refs: Set<string>): boolean {
  const r = ref?.trim();
  if (!r) return false;
  if (refs.has(r)) return false;
  const num = r.match(/มาตรา\s*(\d+)/)?.[1];
  if (num) {
    for (const known of refs) {
      if (known.includes(`มาตรา ${num}`) || known.includes(`มาตรา${num}`)) return false;
    }
    return true; // a section number we don't know
  }
  return false; // no section number → law-name-only citation is acceptable
}

export async function POST(req: Request) {
  const body = await readJson<SearchBody>(req);
  const query = body?.query?.trim();
  if (!query) return error("กรุณาระบุคำค้นหา (query)", 400);

  const match = matchCategory(query);
  const category = match ? getCategoryById(match.categoryId) : undefined;
  const sourcesList = match ? sourcesForCategory(match.categoryId) : [];
  const refs = knownRefs();

  // Deterministic sources — used both as the prose fallback and to back the
  // answer when the model returns plain prose instead of structured sources.
  const deterministicSources = sourcesList
    .flatMap((src) =>
      src.sections.slice(0, 3).map((s) => ({ lawName: src.name, ref: s.ref, label: s.label })),
    )
    .slice(0, 4);

  // Build a rich grounding block: category + sub-problems + real source sections.
  let context = "";
  if (category) {
    context += `หมวดกฎหมายที่ตรง: ${category.title} (${category.id})\n`;
    context += `คำอธิบายหมวด: ${category.description}\n`;
    if (category.subProblems.length) {
      context += `ปัญหาย่อยที่พบบ่อย: ${category.subProblems.map((sp) => sp.title).join(" / ")}\n`;
    }
  }
  for (const src of sourcesList) {
    context += `\nกฎหมายที่เกี่ยวข้อง (ต้องใช้อ้างอิงเท่านั้น):\n${src.name} (${src.shortName})\n`;
    context += src.sections.map((s) => `- ${s.ref} — ${s.label}`).join("\n");
  }

  try {
    const system = buildSystemPrompt();
    const user = buildSearchPrompt(query, context);
    let result = await generate(system, user);
    // One retry for transient upstream failures (timeout / rate-limit) so a
    // single hiccup doesn't drop the whole answer to the data-layer fallback.
    if (!result.live) {
      result = await generate(system, user);
    }

    if (result.live && result.content) {
      const parsed = parseJsonFromText<SearchOutput>(result.content);
      // If DeepSeek returned plain prose instead of JSON, wrap it as an answer.
      const answer = parsed?.answer || result.content.trim();
      if (answer && answer.length > 30 && !isEvasive(answer)) {
        const check = checkGuardrails(result.content);
        // Sanitize citations: drop any ref outside our registry, then fall back
        // to the deterministic sources if none survive. This keeps the answer
        // (grounded in the context we sent) while never surfacing a made-up
        // section number in the sources array.
        const modelSources = parsed?.sources ?? [];
        const cleanSources = modelSources.filter(
          (s) => !s.ref || !isFabricatedRef(s.ref, refs),
        );
        const sources = cleanSources.length ? cleanSources : deterministicSources;
        if (!check.blocked) {
          return json({
            answer,
            sources,
            nextSteps:
              parsed?.nextSteps?.length ? parsed.nextSteps : ["รวบรวมหลักฐานที่เกี่ยวข้องให้ครบ", "ปรึกษาทนายความผู้เชี่ยวชาญหากต้องการความมั่นใจ"],
            categoryId: parsed?.categoryId ?? match?.categoryId,
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
