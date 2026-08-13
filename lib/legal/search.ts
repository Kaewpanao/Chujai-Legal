/**
 * Chujai Legal — AI legal search (client-side mock engine).
 * Matches a free-text Thai query against the category keyword registry and
 * builds a warm, sourced answer. This is the offline stand-in for the
 * DeepSeek-backed /api/ai/search route described in Master Design §A.3.
 * Guardrail: always cite source, never fabricate, never give legal "advice".
 */

import { LEGAL_CATEGORIES, getCategoryById } from "./categories";
import { sourcesForCategory, type LegalSource } from "./sources";

export interface SearchSourceHit {
  label: string;
  ref: string;
  lawName: string;
}

export interface SearchResult {
  matched: boolean;
  categoryId?: string;
  categoryTitle?: string;
  answer: string;
  sources: SearchSourceHit[];
  nextSteps: string[];
}

export interface SearchMatch {
  categoryId: string;
  score: number;
}

/**
 * Weight a keyword by its specificity: short generic words ("ชน", "รถ", "หอ",
 * "หนี้") are common across categories and must not steal a query away from a
 * rarer, more specific phrase ("ประกัน", "ค้ำประกัน", "ชนแล้วหนี"). Longer
 * keywords are treated as more specific.
 */
function keywordWeight(kw: string): number {
  const len = kw.length;
  if (len >= 9) return 5; // long compound phrases (ชนแล้วหนี, ประกันไม่จ่าย, ถูกเลิกจ้าง)
  if (len >= 6) return 4; // multi-syllable specific (ประกัน, กรมธรรม์, ค้ำประกัน)
  if (len >= 4) return 3; // medium (เคลม, มัดจำ, ค่าเช่า, ทวงหนี้)
  if (len >= 3) return 2; // short but meaningful (รถ, หอ, หนี้)
  return 1; // 1-2 char generic (ชน, ด่า, งัด)
}

/**
 * Score categories by how well their keywords, sub-problem titles and title
 * match the query. Rarer/specific keywords and sub-problem titles carry more
 * weight so a generic word like "ชน" cannot beat "ประกัน" on an insurance query.
 */
export function matchCategory(query: string): SearchMatch | null {
  const q = query.toLowerCase();
  let best: SearchMatch | null = null;

  for (const cat of LEGAL_CATEGORIES) {
    let score = 0;
    let keywordMatches = 0;

    // 1) keywords, weighted by specificity.
    for (const kw of cat.keywords) {
      if (kw && q.includes(kw.toLowerCase())) {
        score += keywordWeight(kw);
        keywordMatches++;
      }
    }

    // Co-occurrence bonus: several distinct keywords from the same category
    // is a stronger signal than one long keyword from another (e.g. "ชน"+"รถ"
    // together beat a lone "บาดเจ็บ"). This is what stops a single generic
    // term from stealing a query away from a multi-signal category.
    if (keywordMatches >= 2) score += 3;

    // 2) sub-problem titles (highly specific — a full-title hit is decisive).
    for (const sp of cat.subProblems) {
      const title = sp.title.toLowerCase();
      if (title && q.includes(title)) {
        score += 6;
      } else {
        // match the significant words of the title too.
        for (const part of title.split(/[\s/·]+/)) {
          if (part.length >= 4 && q.includes(part)) score += 2;
        }
      }
    }

    // 3) literal category-title match.
    if (cat.title && q.includes(cat.title.toLowerCase())) score += 5;

    if (score > 0 && (!best || score > best.score)) {
      best = { categoryId: cat.id, score };
    }
  }
  return best;
}

/** Build a warm, sourced mock answer for a given query. */
export function buildSearchResult(query: string): SearchResult {
  const match = matchCategory(query);

  if (!match) {
    return {
      matched: false,
      answer:
        "เราพยายามค้นหาข้อมูลที่ใกล้เคียงที่สุดให้คุณแล้ว แต่ยังไม่พบหมวดที่ตรงใจ " +
        "ลองเล่าเป็นคำพูดของตัวเองสักหน่อย เช่น “ถูกโกงโอนเงิน” หรือ “ถูกเลิกจ้าง” " +
        "แล้วเราจะช่วยหาแนวทางให้คุณค่ะ",
      sources: [],
      nextSteps: [
        "ลองพิมพ์ด้วยคำที่ง่ายและเจาะจงมากขึ้น",
        "หรือเลือกหมวดหมู่จากหน้าหลักเพื่อเริ่มวินิจฉัย",
      ],
    };
  }

  const cat = getCategoryById(match.categoryId)!;
  const sourcesList: LegalSource[] = sourcesForCategory(cat.id);

  const sources: SearchSourceHit[] = sourcesList
    .flatMap((src) =>
      src.sections.slice(0, 2).map((s) => ({
        label: s.label,
        ref: s.ref,
        lawName: src.name,
      })),
    )
    .slice(0, 4);

  const sourceLine = sourcesList.length ? ` (${sourcesList[0].shortName})` : "";

  const answer =
    `เราเข้าใจนะคะ เรื่อง “${cat.title}” เป็นเรื่องที่หลายคนกังวลใจมาก ` +
    `จากข้อมูลที่คุณเล่า เรื่องนี้เข้าข่ายหมวด “${cat.title}” ซึ่งกฎหมายไทยให้ความคุ้มครองคุณอยู่${sourceLine} ` +
    `คุณมีสิทธิได้รับความคุ้มครองตามกฎหมาย — เราช่วยอธิบายสิทธิและขั้นตอนให้คุณตัดสินใจเองได้ ไม่ต้องเผชิญเรื่องนี้คนเดียวค่ะ`;

  const nextSteps = [
    `เก็บรวบรวมหลักฐานที่เกี่ยวข้องกับ “${cat.title}” ให้ครบ (ภาพ ข้อความ เอกสาร)`,
    "เริ่มวินิจฉัยปัญหาแบบละเอียดทีละขั้นกับ AI ของเรา",
    "ปรึกษาทนายความผู้เชี่ยวชาญ หากต้องการความมั่นใจเพิ่มเติม",
  ];

  return {
    matched: true,
    categoryId: cat.id,
    categoryTitle: cat.title,
    answer,
    sources,
    nextSteps,
  };
}
