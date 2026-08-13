/**
 * Chujai Legal — legal source registry.
 * A small, curated registry of well-known Thai laws used to back every
 * legal claim on the consumer pages. Every claim MUST cite an entry here
 * (guardrail: "no-fabricated-citations" / "always-cite-source").
 * Source: Master Design §B.1 (SAFETY RULES) + §F.5 (Tone Rules).
 */

export interface LegalSourceSection {
  /** Human label for the provision (Thai) */
  label: string;
  /** The specific section reference, e.g. "มาตรา 341" */
  ref: string;
}

export interface LegalSource {
  /** Stable id, e.g. "criminal-code" */
  id: string;
  /** Full Thai law name */
  name: string;
  /** Short label for badges, e.g. "ป.อาญา" */
  shortName: string;
  /** Which domain / categories this source serves */
  domain: string;
  /** Well-known, safe-to-cite provisions */
  sections: LegalSourceSection[];
}

export const LEGAL_SOURCES: LegalSource[] = [
  {
    id: "criminal-code",
    name: "ประมวลกฎหมายอาญา",
    shortName: "ป.อาญา",
    domain: "อาชญากรรม · ภัยออนไลน์ · หมิ่นประมาท",
    sections: [
      { label: "ฉ้อโกง (หลอกเอาทรัพย์ผู้อื่น)", ref: "มาตรา 341" },
      { label: "หมิ่นประมาท", ref: "มาตรา 326" },
      { label: "ลักทรัพย์", ref: "มาตรา 334" },
      { label: "ทำร้ายร่างกาย", ref: "มาตรา 295" },
      { label: "กรรโชกทรัพย์", ref: "มาตรา 337" },
      { label: "แจ้งความเท็จ", ref: "มาตรา 177" },
    ],
  },
  {
    id: "civil-code",
    name: "ประมวลกฎหมายแพ่งและพาณิชย์",
    shortName: "ป.พ.พ.",
    domain: "ละเมิด · สัญญา · ครอบครัว · ทรัพย์สิน",
    sections: [
      { label: "ละเมิด (สิทธิเรียกค่าเสียหาย)", ref: "มาตรา 420" },
      { label: "นายจ้างร่วมรับผิด", ref: "มาตรา 425" },
      { label: "จำนอง (สิทธิของผู้รับจำนอง)", ref: "มาตรา 702" },
      { label: "การไถ่ถอนจำนอง", ref: "มาตรา 714" },
      { label: "สินสมรส", ref: "มาตรา 1474" },
    ],
  },
  {
    id: "computer-crime",
    name: "พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ พ.ศ. 2550",
    shortName: "พ.ร.บ.คอมพิวเตอร์",
    domain: "ภัยออนไลน์ · หมิ่นประมาท",
    sections: [
      { label: "นำเข้าข้อมูลคอมพิวเตอร์อันเป็นเท็จ", ref: "มาตรา 14" },
    ],
  },
  {
    id: "consumer-protection",
    name: "พ.ร.บ. คุ้มครองผู้บริโภค พ.ศ. 2522",
    shortName: "พ.ร.บ.คุ้มครองผู้บริโภค",
    domain: "ผู้บริโภค",
    sections: [{ label: "สิทธิของผู้บริโภค", ref: "มาตรา 4" }],
  },
  {
    id: "labour-protection",
    name: "พ.ร.บ. คุ้มครองแรงงาน พ.ศ. 2541",
    shortName: "พ.ร.บ.คุ้มครองแรงงาน",
    domain: "แรงงาน",
    sections: [
      { label: "การบอกเลิกสัญญาจ้างล่วงหน้า", ref: "มาตรา 17" },
      { label: "ค่าชดเชยกรณีเลิกจ้าง", ref: "มาตรา 118" },
    ],
  },
  {
    id: "revenue-code",
    name: "ประมวลรัษฎากร",
    shortName: "ประมวลรัษฎากร",
    domain: "ภาษี",
    sections: [
      { label: "เงินได้พึงประเมิน", ref: "มาตรา 40" },
      { label: "การหักลดหย่อน", ref: "มาตรา 47" },
    ],
  },
  {
    id: "pdpa",
    name: "พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
    shortName: "PDPA",
    domain: "ข้อมูลส่วนบุคคล",
    sections: [{ label: "การเก็บรวบรวมข้อมูลส่วนบุคคล", ref: "มาตรา 19" }],
  },
  {
    id: "residential-lease",
    name: "พ.ร.บ. การเช่าอสังหาริมทรัพย์เพื่ออยู่อาศัย พ.ศ. 2561",
    shortName: "พ.ร.บ.เช่าที่อยู่อาศัย",
    domain: "ที่อยู่อาศัย",
    sections: [
      { label: "เงินประกัน/มัดจำ (เรียกได้ไม่เกินค่าเช่า 1 เดือน)", ref: "มาตรา 30" },
      { label: "การคืนเงินประกันเมื่อสัญญาระงับ", ref: "มาตรา 31" },
      { label: "การบอกเลิกสัญญาเช่า", ref: "มาตรา 33" },
    ],
  },
  {
    id: "vehicle-victim",
    name: "พ.ร.บ. คุ้มครองผู้ประสบภัยจากรถ พ.ศ. 2535",
    shortName: "พ.ร.บ.รถยนต์",
    domain: "อุบัติเหตุ",
    sections: [
      { label: "สิทธิได้รับค่าเสียหายเบื้องต้น", ref: "มาตรา 23" },
      { label: "ค่าเสียหายเบื้องต้น (ค่ารักษาพยาบาล ค่าปลงศพ)", ref: "มาตรา 24" },
      { label: "เรียกค่าเสียหายเพิ่มเติมจากคู่กรณี", ref: "มาตรา 25" },
    ],
  },
  {
    id: "insurance-code",
    name: "ประมวลกฎหมายแพ่งและพาณิชย์ (บรรพ 3 ลักษณะ 20 ประกันภัย)",
    shortName: "ป.พ.พ.",
    domain: "ประกันภัย",
    sections: [
      { label: "สัญญาประกันภัย (นิยาม)", ref: "มาตรา 861" },
      { label: "หน้าที่แถลงข้อความจริงของผู้เอาประกันภัย", ref: "มาตรา 867" },
      { label: "ผู้รับประกันภัยต้องใช้ค่าสินไหมทดแทน", ref: "มาตรา 873" },
    ],
  },
  {
    id: "debt-collection",
    name: "พ.ร.บ. การทวงถามหนี้ พ.ศ. 2558",
    shortName: "พ.ร.บ.ทวงถามหนี้",
    domain: "หนี้สิน",
    sections: [
      { label: "ข้อห้ามทวงหนี้โดยข่มขู่/คุกคาม", ref: "มาตรา 11" },
      { label: "กำหนดเวลาในการติดต่อทวงถามหนี้", ref: "มาตรา 12" },
    ],
  },
  {
    id: "suretyship",
    name: "ประมวลกฎหมายแพ่งและพาณิชย์ (ค้ำประกัน)",
    shortName: "ป.พ.พ.",
    domain: "หนี้สิน · ค้ำประกัน",
    sections: [
      { label: "สัญญาค้ำประกัน (ผู้ค้ำประกันต้องชดใช้เมื่อลูกหนี้ไม่ชำระ)", ref: "มาตรา 680" },
    ],
  },
  {
    id: "family-law",
    name: "ประมวลกฎหมายแพ่งและพาณิชย์ (บรรพ 5 ครอบครัว)",
    shortName: "ป.พ.พ.",
    domain: "ครอบครัว",
    sections: [
      { label: "เหตุฟ้องหย่า", ref: "มาตรา 1516" },
      { label: "อำนาจปกครองบุตร", ref: "มาตรา 1564" },
      { label: "การอุปการะเลี้ยงดูบุตร", ref: "มาตรา 1566" },
    ],
  },
  {
    id: "domestic-violence",
    name: "พ.ร.บ. คุ้มครองผู้ถูกกระทำด้วยความรุนแรงในครอบครัว พ.ศ. 2550",
    shortName: "พ.ร.บ.ความรุนแรงในครอบครัว",
    domain: "ครอบครัว",
    sections: [
      { label: "มาตรการคุ้มครองผู้ถูกกระทำด้วยความรุนแรง", ref: "มาตรา 4" },
    ],
  },
];

export function getSourceById(id: string): LegalSource | undefined {
  return LEGAL_SOURCES.find((s) => s.id === id);
}

/**
 * Map a category id to the legal source(s) that back it. A category can
 * reference more than one source (e.g. insurance = vehicle victim act + the
 * insurance title of the civil code).
 */
export function sourcesForCategory(categoryId: string): LegalSource[] {
  switch (categoryId) {
    case "online_fraud":
    case "crime":
    case "defamation":
      return [getSourceById("criminal-code")!];
    case "labour":
      return [getSourceById("labour-protection")!];
    case "consumer":
      return [getSourceById("consumer-protection")!];
    case "housing":
      return [getSourceById("residential-lease")!];
    case "accident":
      return [getSourceById("vehicle-victim")!];
    case "insurance":
      return [getSourceById("vehicle-victim")!, getSourceById("insurance-code")!];
    case "property":
      return [getSourceById("civil-code")!];
    case "family":
      return [getSourceById("family-law")!, getSourceById("domestic-violence")!];
    case "government":
      return [getSourceById("pdpa")!];
    case "debt":
      return [getSourceById("debt-collection")!, getSourceById("suretyship")!];
    default:
      return [];
  }
}

/** Primary source for a category (backwards-compatible single-source view). */
export function sourceForCategory(categoryId: string): LegalSource | undefined {
  return sourcesForCategory(categoryId)[0];
}

/** Render a safe citation string, e.g. "ป.อาญา มาตรา 341" */
export function cite(shortName: string, ref?: string): string {
  return ref ? `${shortName} ${ref}` : shortName;
}
