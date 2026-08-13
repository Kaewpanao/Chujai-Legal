/**
 * Chujai Legal — legal domain categories.
 * 12 categories that map directly to the concierge flow engine.
 * Source: Master Design §C.1 / §D.2 (Category-Specific Question Flows).
 */

export interface SubProblem {
  /** Stable slug, e.g. "1.1" */
  id: string;
  /** Thai title, e.g. "ซื้อของออนไลน์ไม่ได้ของ" */
  title: string;
}

export interface LegalCategory {
  /** Stable slug used for routing & detection, e.g. "online_fraud" */
  id: string;
  /** Ordinal 1–12 */
  number: number;
  /** Thai display title */
  title: string;
  /** Warm emoji icon */
  icon: string;
  /** Short empathetic hint shown on category cards */
  hint: string;
  /** Longer description for search results & detail pages */
  description: string;
  /** Number of cases helped (social proof signal) */
  socialProof: number;
  /** Accent hex color for the category */
  accent: string;
  /** Sub-problems this category covers */
  subProblems: SubProblem[];
  /** Thai keywords for free-text matching */
  keywords: string[];
}

export const LEGAL_CATEGORIES: LegalCategory[] = [
  {
    id: "online_fraud",
    number: 1,
    title: "ภัยออนไลน์",
    icon: "💻",
    hint: "ถูกโกงออนไลน์ โดนหลอกโอนเงิน เราช่วยทวงคืนได้",
    description: "ซื้อของไม่ได้ของ โดน Call Center หลอก แอปกู้เถื่อน Romance Scam หรือแชร์ลูกโซ่ — เราเข้าใจ และช่วยคุณรวบรวมหลักฐานเพื่อดำเนินการ",
    socialProof: 2340,
    accent: "#2563eb",
    keywords: ["โกง", "หลอก", "โอนเงิน", "แอป", "call center", "romance scam", "แชร์ลูกโซ่", "ซื้อของ"],
    subProblems: [
      { id: "1.1", title: "ซื้อของออนไลน์ไม่ได้ของ" },
      { id: "1.2", title: "Call Center หลอกโอนเงิน" },
      { id: "1.3", title: "แอปกู้เงินเถื่อน" },
      { id: "1.4", title: "Romance Scam" },
      { id: "1.5", title: "แชร์ลูกโซ่" },
    ],
  },
  {
    id: "crime",
    number: 2,
    title: "อาชญากรรม",
    icon: "🚨",
    hint: "ถูกทำร้าย ถูกลักทรัพย์ จัดการให้ปลอดภัยก่อน เราอยู่ข้างคุณ",
    description: "ทำร้ายร่างกาย ลักทรัพย์ ข่มขืน/อนาจาร หรือขู่กรรโชก — เราช่วยแนะนำขั้นตอนที่ปลอดภัยและถูกกฎหมายทันที",
    socialProof: 980,
    accent: "#dc3e4b",
    keywords: ["ทำร้าย", "ลักทรัพย์", "ข่มขืน", "อนาจาร", "ขู่", "กรรโชก", "แจ้งความ", "งัด", "ขโมย", "ทอง", "พระ", "บ้านโดนงัด"],
    subProblems: [
      { id: "2.1", title: "ถูกทำร้ายร่างกาย" },
      { id: "2.2", title: "ถูกลักทรัพย์" },
      { id: "2.3", title: "ข่มขืน / อนาจาร" },
      { id: "2.4", title: "ถูกขู่กรรโชก" },
    ],
  },
  {
    id: "defamation",
    number: 3,
    title: "หมิ่นประมาท",
    icon: "📢",
    hint: "ถูกด่า ถูกปล่อยภาพ ถูกใส่ความ คุณมีสิทธิปกป้องตัวเอง",
    description: "ถูกด่าบนโซเชียล ภาพหลุด Revenge Porn ถูกใส่ความ หรือข้อมูลรั่วไหล (PDPA) — เราช่วยคุณเก็บหลักฐานและรู้สิทธิ",
    socialProof: 760,
    accent: "#7c3aed",
    keywords: ["หมิ่นประมาท", "ด่า", "ใส่ความ", "ภาพหลุด", "revenge porn", "pdpa", "ข้อมูลรั่ว", "telegram", "รูปโป๊", "โพสต์", "แอบถ่าย"],
    subProblems: [
      { id: "3.1", title: "ถูกด่าบนโซเชียล" },
      { id: "3.2", title: "ภาพหลุด / Revenge Porn" },
      { id: "3.3", title: "ถูกใส่ความ" },
      { id: "3.4", title: "PDPA ข้อมูลรั่วไหล" },
    ],
  },
  {
    id: "insurance",
    number: 4,
    title: "ประกันภัย",
    icon: "🛡️",
    hint: "บริษัทประกันไม่จ่าย เราช่วยคุณเคลมอย่างถูกวิธี",
    description: "เคลมประกันรถ ประกันสุขภาพไม่ผ่าน หรืออยากยกเลิกกรมธรรม์ — เราช่วยให้คุณรู้ขั้นตอนและสิทธิอย่างชัดเจน",
    socialProof: 1120,
    accent: "#0f9f6e",
    keywords: ["ประกัน", "เคลม", "กรมธรรม์", "ประกันรถ", "ประกันสุขภาพ", "ยกเลิกกรมธรรม์"],
    subProblems: [
      { id: "4.1", title: "เคลมประกันรถ" },
      { id: "4.2", title: "เคลมประกันสุขภาพ" },
      { id: "4.3", title: "ยกเลิกกรมธรรม์" },
    ],
  },
  {
    id: "government",
    number: 5,
    title: "หน่วยงานรัฐ",
    icon: "🏛️",
    hint: "ติดต่อราชการไม่คืบ โดนรัฐละเมิด เราช่วยยื่นเรื่องให้ถูกต้อง",
    description: "ขอทะเบียน/บัตรประชาชน โดนหน่วยงานรัฐละเมิด หรือร้องเรียนแล้วไม่ได้รับคำตอบ — เราช่วยคุณยื่นเรื่องอย่างถูกต้อง",
    socialProof: 540,
    accent: "#0891b2",
    keywords: ["ราชการ", "ทะเบียน", "บัตรประชาชน", "รัฐละเมิด", "ร้องเรียน", "หน่วยงาน"],
    subProblems: [
      { id: "5.1", title: "ขอทะเบียน / บัตรประชาชน" },
      { id: "5.2", title: "ถูกหน่วยงานรัฐละเมิด" },
      { id: "5.3", title: "ร้องเรียนแล้วไม่ได้รับคำตอบ" },
    ],
  },
  {
    id: "property",
    number: 6,
    title: "ที่ดินและทรัพย์สิน",
    icon: "🏠",
    hint: "ปัญหาที่ดิน มรดก โฉนด เราแปลกฎหมายให้เข้าใจง่าย",
    description: "ที่ดินถูกบุกรุก พิพาทแนวเขต ซื้อขายไม่ได้ มรดก หรือโฉนดหาย — เราช่วยให้คุณเข้าใจสิทธิในทรัพย์สิน",
    socialProof: 890,
    accent: "#d97706",
    keywords: ["ที่ดิน", "โฉนด", "บุกรุก", "แนวเขต", "มรดก", "ซื้อขาย", "ทรัพย์สิน"],
    subProblems: [
      { id: "6.1", title: "ที่ดินถูกบุกรุก" },
      { id: "6.2", title: "พิพาทแนวเขต" },
      { id: "6.3", title: "ซื้อขายที่ดินไม่ได้" },
      { id: "6.4", title: "มรดก" },
      { id: "6.5", title: "โฉนดหาย" },
    ],
  },
  {
    id: "labour",
    number: 7,
    title: "แรงงาน",
    icon: "👷",
    hint: "ถูกเลิกจ้าง ไม่ได้ค่าจ้าง เราช่วยรู้สิทธิแรงงานของคุณ",
    description: "ถูกเลิกจ้างไม่เป็นธรรม ไม่ได้รับค่าจ้าง/ค่าชดเชย บาดเจ็บจากการทำงาน หรือถูกล่วงละเมิดในที่ทำงาน — คุณมีสิทธิ เราช่วยชี้ทาง",
    socialProof: 1450,
    accent: "#e88a08",
    keywords: ["แรงงาน", "เลิกจ้าง", "ค่าจ้าง", "ค่าชดเชย", "บาดเจ็บ", "ล่วงละเมิด", "นายจ้าง"],
    subProblems: [
      { id: "7.1", title: "ถูกเลิกจ้างไม่เป็นธรรม" },
      { id: "7.2", title: "ไม่จ่ายค่าจ้าง / ค่าชดเชย" },
      { id: "7.3", title: "บาดเจ็บจากการทำงาน" },
      { id: "7.4", title: "ถูกล่วงละเมิดในที่ทำงาน" },
    ],
  },
  {
    id: "consumer",
    number: 8,
    title: "ผู้บริโภค",
    icon: "🛒",
    hint: "สินค้าชำรุด โดนโฆษณาหลอก เราช่วยทวงสิทธิผู้บริโภค",
    description: "สินค้าชำรุด/ไม่ตรงปก โดนโฆษณาหลอกลวง บริการไม่เป็นไปตามสัญญา หรือสัญญาสำเร็จรูปไม่เป็นธรรม — เราช่วยทวงสิทธิ",
    socialProof: 1680,
    accent: "#db2777",
    keywords: ["ผู้บริโภค", "สินค้า", "ชำรุด", "โฆษณา", "หลอกลวง", "สัญญา", "ไม่ตรงปก"],
    subProblems: [
      { id: "8.1", title: "สินค้าชำรุด / ไม่ตรงปก" },
      { id: "8.2", title: "โฆษณาหลอกลวง" },
      { id: "8.3", title: "บริการไม่เป็นไปตามสัญญา" },
      { id: "8.4", title: "ถูกเอาเปรียบจากสัญญาสำเร็จรูป" },
    ],
  },
  {
    id: "debt",
    number: 9,
    title: "หนี้สิน",
    icon: "💰",
    hint: "หนี้ท่วม โดนทวง เราเข้าใจ และช่วยหาทางออก",
    description: "หนี้บัตรเครดิต ถูกฟ้องล้มละลาย หนี้นอกระบบ หรือค้ำประกันแล้วลูกหนี้หนี — เราเข้าใจ และช่วยหาทางออกทีละขั้น",
    socialProof: 1210,
    accent: "#dc2626",
    keywords: ["หนี้", "บัตรเครดิต", "ล้มละลาย", "หนี้นอกระบบ", "ค้ำประกัน", "ทวงหนี้"],
    subProblems: [
      { id: "9.1", title: "หนี้บัตรเครดิต" },
      { id: "9.2", title: "ถูกฟ้องล้มละลาย" },
      { id: "9.3", title: "หนี้นอกระบบ" },
      { id: "9.4", title: "ค้ำประกันแล้วลูกหนี้หนี" },
    ],
  },
  {
    id: "housing",
    number: 10,
    title: "ที่อยู่อาศัย",
    icon: "🏢",
    hint: "ปัญหาเช่าบ้าน มัดจำไม่คืน เราช่วยให้คุณไม่ถูกเอาเปรียบ",
    description: "ถูกไล่ออกจากหอ/คอนโด มัดจำไม่คืน หรือค่าเช่าขึ้นไม่เป็นธรรม — เราช่วยให้คุณรู้สิทธิผู้เช่าอย่างชัดเจน",
    socialProof: 640,
    accent: "#4f46e5",
    keywords: ["เช่า", "หอ", "คอนโด", "มัดจำ", "ค่าเช่า", "ไล่ออก", "ห้อง"],
    subProblems: [
      { id: "10.1", title: "ถูกไล่ออกจากหอ / คอนโด" },
      { id: "10.2", title: "มัดจำไม่คืน" },
      { id: "10.3", title: "ค่าเช่าขึ้นไม่เป็นธรรม" },
    ],
  },
  {
    id: "family",
    number: 11,
    title: "ครอบครัว",
    icon: "👨‍👩‍👧",
    hint: "ปัญหาครอบครัว หย่า ทรัพย์สิน บุตร เราเข้าใจและช่วยอย่างละมุน",
    description: "หย่าร้าง แบ่งสินสมรส ค่าเลี้ยงดูบุตร รับบุตรบุญธรรม หรือความรุนแรงในครอบครัว — เราเข้าใจ และช่วยอย่างละมุน",
    socialProof: 820,
    accent: "#ec4899",
    keywords: ["ครอบครัว", "หย่า", "สินสมรส", "ค่าเลี้ยงดู", "บุตร", "บุญธรรม", "ความรุนแรง"],
    subProblems: [
      { id: "11.1", title: "หย่าร้าง" },
      { id: "11.2", title: "แบ่งสินสมรส" },
      { id: "11.3", title: "ค่าเลี้ยงดูบุตร" },
      { id: "11.4", title: "รับบุตรบุญธรรม" },
      { id: "11.5", title: "ความรุนแรงในครอบครัว" },
    ],
  },
  {
    id: "accident",
    number: 12,
    title: "อุบัติเหตุ",
    icon: "🚗",
    hint: "อุบัติเหตุ ถูกชนแล้วหนี เราช่วยคุณเรียกร้องอย่างเป็นระบบ",
    description: "ถูกชนแล้วหนี ชนแล้วคู่กรณีไม่ยอม หรือเรียกค่าเสียหายจากอุบัติเหตุ — เราช่วยคุณเรียกร้องอย่างเป็นระบบ",
    socialProof: 1050,
    accent: "#ea580c",
    keywords: ["อุบัติเหตุ", "ชน", "รถ", "ค่าเสียหาย", "ชนแล้วหนี", "คู่กรณี"],
    subProblems: [
      { id: "12.1", title: "ถูกชนแล้วหนี" },
      { id: "12.2", title: "ชนแล้วคู่กรณีไม่ยอม" },
      { id: "12.3", title: "เรียกค่าเสียหายจากอุบัติเหตุ" },
    ],
  },
];

export const TOTAL_CATEGORIES = LEGAL_CATEGORIES.length;

export const TOTAL_CASES_HELPED = LEGAL_CATEGORIES.reduce(
  (sum, c) => sum + c.socialProof,
  0,
);

export function getCategoryById(id: string): LegalCategory | undefined {
  return LEGAL_CATEGORIES.find((c) => c.id === id);
}

export function getCategoryByNumber(number: number): LegalCategory | undefined {
  return LEGAL_CATEGORIES.find((c) => c.number === number);
}
