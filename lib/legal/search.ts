/**
 * Chujai Legal — AI legal search (client-side mock engine).
 * Matches a free-text Thai query against the category keyword registry and
 * builds a warm, sourced answer. This is the offline stand-in for the
 * DeepSeek-backed /api/ai/search route described in Master Design §A.3.
 * Guardrail: always cite source, never fabricate, never give legal "advice".
 */

import { LEGAL_CATEGORIES, getCategoryById } from "./categories";
import { sourceForCategory } from "./sources";

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

/** Score categories by how many of their keywords appear in the query. */
export function matchCategory(query: string): SearchMatch | null {
  const q = query.toLowerCase();
  let best: SearchMatch | null = null;

  for (const cat of LEGAL_CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (kw && q.includes(kw.toLowerCase())) score += 1;
    }
    if (cat.title.toLowerCase().includes(q)) score += 2;
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
  const source = sourceForCategory(cat.id);

  const sources: SearchSourceHit[] = source
    ? source.sections.slice(0, 2).map((s) => ({
        label: s.label,
        ref: s.ref,
        lawName: source.name,
      }))
    : [];

  const sourceLine = source ? ` (${source.shortName})` : "";

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
