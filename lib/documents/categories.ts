/**
 * Chujai Legal — document library registry.
 * 10 document categories + sample templates shown on the documents page.
 * Source: Master Design §A.3 (lib/documents) + §C.1 (document checklists).
 */

export interface DocumentCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  accent: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  /** Number of {{fill-in}} fields */
  fields: number;
  /** Estimated minutes to complete */
  minutes: number;
  /** Included in free tier */
  free: boolean;
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: "police", title: "แจ้งความ / ร้องทุกข์", icon: "🚔", description: "เอกสารแจ้งความต่อเจ้าหน้าที่ตำรวจ", accent: "#dc3e4b" },
  { id: "demand", title: "ทวงหนี้ / ทวงสิทธิ", icon: "📬", description: "หนังสือทวงถามอย่างเป็นทางการ", accent: "#e88a08" },
  { id: "complaint", title: "ร้องเรียน", icon: "📢", description: "หนังสือร้องเรียนหน่วยงาน/บริษัท", accent: "#7c3aed" },
  { id: "consumer", title: "ฟ้องคดีผู้บริโภค", icon: "🛒", description: "คำฟ้องคดีผู้บริโภคแบบง่าย", accent: "#db2777" },
  { id: "family", title: "ครอบครัว", icon: "👨‍👩‍👧", description: "ฟ้องหย่า ค่าเลี้ยงดู สินสมรส", accent: "#ec4899" },
  { id: "property", title: "ที่ดิน / ทรัพย์สิน", icon: "🏠", description: "โฉนด มรดก สัญญาซื้อขาย", accent: "#d97706" },
  { id: "contract", title: "สัญญา", icon: "📝", description: "สัญญาเช่า จ้าง ฯลฯ", accent: "#2563eb" },
  { id: "labour", title: "แรงงาน", icon: "👷", description: "คำร้องแรงงาน ค่าชดเชย", accent: "#e88a08" },
  { id: "estate", title: "พินัยกรรม / มรดก", icon: "📜", description: "พินัยกรรม หนังสือมอบอำนาจ", accent: "#0891b2" },
  { id: "notice", title: "บอกกล่าว / เลิกสัญญา", icon: "✉️", description: "หนังสือบอกเลิกสัญญา", accent: "#4f46e5" },
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  { id: "police-report", title: "คำร้องทุกข์แจ้งความ", description: "แจ้งความคดีอาญา (ฉ้อโกง ลักทรัพย์)", categoryId: "police", fields: 9, minutes: 15, free: true },
  { id: "demand-letter", title: "หนังสือทวงหนี้", description: "ทวงถามหนี้อย่างเป็นทางการและสุภาพ", categoryId: "demand", fields: 7, minutes: 10, free: true },
  { id: "consumer-complaint", title: "หนังสือร้องเรียนผู้บริโภค", description: "ร้องเรียนสินค้า/บริการต่อผู้ประกอบการ", categoryId: "complaint", fields: 8, minutes: 12, free: true },
  { id: "consumer-filing", title: "คำฟ้องคดีผู้บริโภค", description: "ฟ้องเรียกค่าเสียหายด้วยตนเอง", categoryId: "consumer", fields: 12, minutes: 20, free: false },
  { id: "divorce-petition", title: "คำฟ้องหย่า", description: "ฟ้องหย่าแบบยินยอมพร้อมแบ่งสินสมรส", categoryId: "family", fields: 14, minutes: 25, free: false },
  { id: "lease-agreement", title: "สัญญาเช่าที่อยู่อาศัย", description: "สัญญาเช่าหอ/คอนโดที่เป็นธรรม", categoryId: "contract", fields: 16, minutes: 15, free: true },
  { id: "employment-contract", title: "สัญญาจ้างแรงงาน", description: "สัญญาจ้างที่คุ้มครองทั้งสองฝ่าย", categoryId: "contract", fields: 15, minutes: 15, free: false },
  { id: "power-of-attorney", title: "หนังสือมอบอำนาจ", description: "มอบอำนาจให้ผู้อื่นทำการแทน", categoryId: "estate", fields: 8, minutes: 8, free: true },
  { id: "will", title: "พินัยกรรม", description: "พินัยกรรมแบบธรรมดา", categoryId: "estate", fields: 10, minutes: 20, free: false },
  { id: "termination-notice", title: "หนังสือบอกเลิกสัญญา", description: "บอกเลิกสัญญา/บริการอย่างถูกต้อง", categoryId: "notice", fields: 6, minutes: 8, free: true },
  { id: "child-support", title: "คำร้องค่าเลี้ยงดูบุตร", description: "ร้องขอค่าเลี้ยงดูบุตร", categoryId: "family", fields: 11, minutes: 20, free: false },
  { id: "labour-complaint", title: "คำร้องแรงงาน", description: "ร้องเรียนเลิกจ้างไม่เป็นธรรม/ค่าชดเชย", categoryId: "labour", fields: 13, minutes: 20, free: false },
];

export function getDocumentCategory(id: string): DocumentCategory | undefined {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id);
}
