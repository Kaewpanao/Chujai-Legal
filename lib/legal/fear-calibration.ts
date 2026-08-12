/**
 * Chujai Legal — fear calibration.
 * 4 emotional levels that tune the AI's tone, urgency, and emphasis.
 * Source: Master Design §B.2 (Fear Calibration) + §F.2 (Fear-Level Color Mapping).
 */

export type FearLevelId = "panic" | "urgent" | "concerned" | "planning";

export type ResponseStyle =
  | "reassurance-first"
  | "action-focused"
  | "informative"
  | "efficient";

export interface FearLevel {
  id: FearLevelId;
  /** Warm emoji */
  emoji: string;
  /** Thai label */
  label: string;
  /** Urgency badge text */
  urgencyBadge: string;
  /** Accent hex color */
  accent: string;
  /** Tone description (Thai) */
  tone: string;
  /** Concrete tone rules injected into the AI prompt */
  toneRules: string[];
  responseStyle: ResponseStyle;
  /** Suggested priority window for action (Thai) */
  urgencyWindow: string;
}

export const FEAR_LEVELS: FearLevel[] = [
  {
    id: "panic",
    emoji: "😱",
    label: "ตื่นตระหนก",
    urgencyBadge: "ด่วนที่สุด — ทำทันที",
    accent: "#dc3e4b",
    tone: "อ่อนโยนเป็นพิเศษ ปลอบใจก่อนเป็นอันดับแรก เน้นการกระทำฉุกเฉิน",
    toneRules: [
      "ปลอบใจก่อนเสมอ: \"ไม่เป็นไรนะ เราอยู่ตรงนี้เพื่อช่วยคุณ\"",
      "บอกขั้นตอนที่ปลอดภัยและเร่งด่วนที่สุดก่อน (ไป รพ. / แจ้งตำรวจ)",
      "แบ่งข้อมูลเป็นชิ้นเล็กๆ ทีละขั้น ไม่ท่วมหัว",
      "ย้ำว่าคุณไม่ได้อยู่คนเดียว",
    ],
    responseStyle: "reassurance-first",
    urgencyWindow: "ภายใน 24 ชั่วโมง",
  },
  {
    id: "urgent",
    emoji: "😰",
    label: "เร่งด่วน",
    urgencyBadge: "เร่งด่วน",
    accent: "#e88a08",
    tone: "เห็นอกเห็นใจแต่เน้นการลงมือทำ บอกขั้นตอนถัดไปที่ชัดเจน",
    toneRules: [
      "ยอมรับความเครียด: \"เรื่องแบบนี้มันเครียดจริงๆ\"",
      "ให้ขั้นตอนถัดไปที่ชัดเจน 1–2 อย่าง",
      "ให้กำลังใจว่าแก้ได้: \"ข่าวดี — เรื่องนี้แก้ได้\"",
    ],
    responseStyle: "action-focused",
    urgencyWindow: "ภายใน 2–3 วัน",
  },
  {
    id: "concerned",
    emoji: "😟",
    label: "กังวล",
    urgencyBadge: "ควรจัดการเร็วๆ",
    accent: "#d97706",
    tone: "ให้ข้อมูลอย่างครบถ้วน เสริมพลังให้ลงมือทำได้เอง",
    toneRules: [
      "วางตัวเลือกทั้งหมดให้เห็น",
      "อธิบายสิทธิอย่างชัดเจน: \"คุณมีสิทธิเต็มที่ตามกฎหมาย\"",
      "กระตุ้นให้เริ่มจากขั้นแรกง่ายๆ",
    ],
    responseStyle: "informative",
    urgencyWindow: "ภายใน 1–2 สัปดาห์",
  },
  {
    id: "planning",
    emoji: "😌",
    label: "วางแผน",
    urgencyBadge: "วางแผนได้เลย",
    accent: "#2563eb",
    tone: "เป็นมืออาชีพ กระชับ ครบถ้วน เน้นประสิทธิภาพ",
    toneRules: [
      "ให้ข้อมูลครบถ้วนเป็นระบบ",
      "สรุปตัวเลือกและข้อดีข้อเสีย",
      "ให้ checklist และขั้นตอนที่เรียงลำดับชัดเจน",
    ],
    responseStyle: "efficient",
    urgencyWindow: "ตามแผนที่วางไว้",
  },
];

export const FEAR_LEVEL_MAP: Record<FearLevelId, FearLevel> = FEAR_LEVELS.reduce(
  (map, level) => {
    map[level.id] = level;
    return map;
  },
  {} as Record<FearLevelId, FearLevel>,
);

export function getFearLevel(id: FearLevelId): FearLevel {
  return FEAR_LEVEL_MAP[id];
}

export function getFearLevelByIndex(index: number): FearLevel {
  return FEAR_LEVELS[Math.max(0, Math.min(FEAR_LEVELS.length - 1, index))];
}
