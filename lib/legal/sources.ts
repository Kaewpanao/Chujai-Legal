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
    sections: [{ label: "ค่าชดเชยกรณีเลิกจ้าง", ref: "มาตรา 118" }],
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
    sections: [],
  },
  {
    id: "vehicle-victim",
    name: "พ.ร.บ. คุ้มครองผู้ประสบภัยจากรถ พ.ศ. 2535",
    shortName: "พ.ร.บ.รถยนต์",
    domain: "อุบัติเหตุ · ประกันภัย",
    sections: [],
  },
];

export function getSourceById(id: string): LegalSource | undefined {
  return LEGAL_SOURCES.find((s) => s.id === id);
}

/** Map a category id to the most relevant legal source id. */
export function sourceForCategory(categoryId: string): LegalSource | undefined {
  switch (categoryId) {
    case "online_fraud":
    case "crime":
    case "defamation":
      return getSourceById("criminal-code");
    case "labour":
      return getSourceById("labour-protection");
    case "consumer":
      return getSourceById("consumer-protection");
    case "housing":
      return getSourceById("residential-lease");
    case "accident":
    case "insurance":
      return getSourceById("vehicle-victim");
    case "property":
    case "family":
      return getSourceById("civil-code");
    case "government":
      return getSourceById("pdpa");
    default:
      return undefined;
  }
}

/** Render a safe citation string, e.g. "ป.อาญา มาตรา 341" */
export function cite(shortName: string, ref?: string): string {
  return ref ? `${shortName} ${ref}` : shortName;
}
