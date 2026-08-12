/**
 * Chujai Legal — admin-dashboard mock data.
 * Platform users, transactions, lawyer verification queue, content & settings.
 * Static placeholders until Supabase is wired in (Phase 4+).
 */

export type UserRole = "consumer" | "lawyer" | "admin";
export type UserStatus = "active" | "banned";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registered: string;
  caseCount: number;
  spend: number;
  status: UserStatus;
}

export type TransactionStatus = "success" | "pending" | "refunded";

export interface Transaction {
  id: string;
  user: string;
  type: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  method: string;
}

export interface VerificationRequest {
  id: string;
  name: string;
  licenseNo: string;
  specialty: string;
  province: string;
  submitted: string;
  documents: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PlatformSetting {
  id: string;
  label: string;
  description: string;
  /** current value (boolean → toggle switch) */
  enabled: boolean;
}

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  consumer: "ผู้ใช้งาน",
  lawyer: "ทนายความ",
  admin: "แอดมิน",
};

export const USERS: PlatformUser[] = [
  { id: "u1", name: "สมชาย ใจดี", email: "somchai@example.com", role: "consumer", registered: "12 มี.ค. 2568", caseCount: 3, spend: 1298, status: "active" },
  { id: "u2", name: "วิภา แสงทอง", email: "wipa@example.com", role: "consumer", registered: "2 ก.ค. 2568", caseCount: 1, spend: 299, status: "active" },
  { id: "u3", name: "อานันท์ ชื่นใจ", email: "anand@example.com", role: "consumer", registered: "18 พ.ค. 2568", caseCount: 2, spend: 999, status: "active" },
  { id: "u4", name: "ทนายสมหมาย รักธรรม", email: "sommai@chujai.legal", role: "lawyer", registered: "5 ม.ค. 2568", caseCount: 28, spend: 0, status: "active" },
  { id: "u5", name: "ทนายอรุณี รักธรรม", email: "arunee@chujai.legal", role: "lawyer", registered: "20 ม.ค. 2568", caseCount: 41, spend: 0, status: "active" },
  { id: "u6", name: "ทนายธนกร รับประกัน", email: "thanakorn@chujai.legal", role: "lawyer", registered: "9 ก.ค. 2568", caseCount: 0, spend: 0, status: "active" },
  { id: "u7", name: "ประเสริฐ มากมี", email: "prasert@example.com", role: "consumer", registered: "3 ก.พ. 2568", caseCount: 1, spend: 999, status: "banned" },
  { id: "u8", name: "น้ำฝน งามพร้อม", email: "namfon@example.com", role: "consumer", registered: "15 มิ.ย. 2568", caseCount: 1, spend: 299, status: "active" },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "TX-9012", user: "สมชาย ใจดี", type: "Case Plus", amount: 999, status: "success", date: "12 ส.ค. 2568", method: "PromptPay" },
  { id: "TX-9011", user: "อานันท์ ชื่นใจ", type: "Case Plus", amount: 999, status: "success", date: "11 ส.ค. 2568", method: "บัตรเครดิต" },
  { id: "TX-9010", user: "วิภา แสงทอง", type: "Action Pack", amount: 299, status: "success", date: "10 ส.ค. 2568", method: "PromptPay" },
  { id: "TX-9009", user: "ประเสริฐ มากมี", type: "ค่าปรึกษาทนาย", amount: 1500, status: "refunded", date: "9 ส.ค. 2568", method: "บัตรเครดิต" },
  { id: "TX-9008", user: "น้ำฝน งามพร้อม", type: "Action Pack", amount: 299, status: "success", date: "8 ส.ค. 2568", method: "PromptPay" },
  { id: "TX-9007", user: "สมชาย ใจดี", type: "Action Pack", amount: 299, status: "success", date: "6 ส.ค. 2568", method: "PromptPay" },
  { id: "TX-9006", user: "กิจการ สดใส", type: "SME Starter", amount: 2990, status: "pending", date: "5 ส.ค. 2568", method: "โอนเงิน" },
  { id: "TX-9005", user: "ชัยวัฒน์ ยั่งยืน", type: "Case Plus", amount: 999, status: "success", date: "4 ส.ค. 2568", method: "บัตรเครดิต" },
];

export const VERIFICATION_QUEUE: VerificationRequest[] = [
  { id: "v1", name: "ทนายธนกร รับประกัน", licenseNo: "ท.12345/2568", specialty: "ประกันภัย", province: "นครราชสีมา", submitted: "9 ก.ค. 2568", documents: ["ใบอนุญาตทนายความ.pdf", "บัตรประชาชน.pdf", "หนังสือรับรองสภา.pdf"] },
  { id: "v2", name: "ทนายภาณุ ใจมั่น", licenseNo: "ท.20456/2567", specialty: "แรงงาน", province: "เชียงใหม่", submitted: "28 ก.ค. 2568", documents: ["ใบอนุญาตทนายความ.pdf", "บัตรประชาชน.pdf"] },
  { id: "v3", name: "ทนายมาลี ศรีสุข", licenseNo: "ท.31011/2566", specialty: "ครอบครัว", province: "ขอนแก่น", submitted: "6 ส.ค. 2568", documents: ["ใบอนุญาตทนายความ.pdf", "หนังสือรับรองสภา.pdf"] },
];

export const FAQS: FaqItem[] = [
  { id: "f1", question: "ชูใจ ลีกัล คืออะไร?", answer: "แพลตฟอร์มให้ความรู้และช่วยเหลือด้านกฎหมายสำหรับคนไทย — ใช้ AI อธิบายกฎหมายเป็นภาษาที่เข้าใจง่าย พร้อมนำทางทีละขั้นตอนจนคุณทำเองได้" },
  { id: "f2", question: "ข้อมูลจาก AI เชื่อถือได้แค่ไหน?", answer: "ทุกคำตอบอ้างอิงกฎหมายจริงและมีข้อความย้ำว่ามิใช่คำปรึกษาทางกฎหมายเฉพาะราย หากเป็นเรื่องซับซ้อนควรปรึกษาทนายความ" },
  { id: "f3", question: "สามารถปรึกษาทนายความได้อย่างไร?", answer: "แพ็กเกจ Case Plus ขึ้นไป มีสิทธิ์ปรึกษาทนายความตามจำนวนครั้งที่ระบุในแพ็กเกจ หรือจ้างทนายโดยตรงผ่านหน้ารายชื่อทนายความ" },
  { id: "f4", question: "ชำระเงินด้วยวิธีใดได้บ้าง?", answer: "รองรับ PromptPay QR, บัตรเครดิต/เดบิต และการโอนเงินผ่านธนาคาร ใบเสร็จออกให้ทุกครั้ง" },
  { id: "f5", question: "ข้อมูลส่วนตัวปลอดภัยหรือไม่?", answer: "เราเก็บรักษาข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และไม่เปิดเผยข้อมูลแก่บุคคลภายนอกโดยไม่ได้รับอนุญาต" },
];

export const PLATFORM_SETTINGS: PlatformSetting[] = [
  { id: "s-commission", label: "ค่าคอมมิชชันแพลตฟอร์ม", description: "อัตราค่าคอมมิชชันที่หักจากค่าบริการทนายความ (ปัจจุบัน 15%)", enabled: true },
  { id: "s-lawyer-verify", label: "บังคับยืนยันตัวตนทนายความ", description: "ทนายความต้องผ่านการยืนยันตัวตนก่อนให้บริการ", enabled: true },
  { id: "s-line-notify", label: "แจ้งเตือนทาง LINE", description: "ส่งแจ้งเตือนความคืบหน้าเคสทาง LINE", enabled: true },
  { id: "s-email-notify", label: "แจ้งเตือนทางอีเมล", description: "ส่งอีเมลสรุปประจำสัปดาห์แก่ผู้ใช้งาน", enabled: true },
  { id: "s-ai-diagnosis", label: "เปิดใช้ AI วินิจฉัย", description: "เปิด/ปิดฟีเจอร์วินิจฉัยปัญหา 8 ขั้นตอน", enabled: true },
  { id: "s-public-signup", label: "เปิดรับสมัครผู้ใช้ใหม่", description: "อนุญาตให้ผู้ใช้สมัครสมาชิกด้วยตนเอง", enabled: true },
];

/** Helpers */
export function countUsersByRole(role: UserRole): number {
  return USERS.filter((u) => u.role === role).length;
}

export function totalRevenue(): number {
  return TRANSACTIONS.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0);
}

export function totalRefunded(): number {
  return TRANSACTIONS.filter((t) => t.status === "refunded").reduce((sum, t) => sum + t.amount, 0);
}
