/**
 * Chujai Legal — lawyer-app mock data (cases, clients, invoices).
 * Static placeholders until Supabase is wired in (Phase 4+).
 * Presented with the same warm, neutral tone as the consumer data layer.
 */

export type CaseStatus = "draft" | "pending_review" | "active" | "filed" | "completed";
export type CasePriority = "high" | "medium" | "low";

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: "created" | "doc" | "court" | "payment" | "note";
}

export interface CaseDocument {
  name: string;
  type: string;
  size: string;
  date: string;
}

export interface LegalCase {
  id: string;
  title: string;
  categoryLabel: string;
  status: CaseStatus;
  clientName: string;
  clientId: string;
  lawyerName: string;
  lastUpdate: string;
  nextDeadline?: string;
  priority: CasePriority;
  fee: number;
  progress: number;
  description: string;
  timeline: TimelineEvent[];
  documents: CaseDocument[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  province: string;
  caseCount: number;
  totalSpent: number;
  joined: string;
  status: "active" | "inactive";
}

export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface Invoice {
  id: string;
  clientName: string;
  caseTitle: string;
  amount: number;
  status: InvoiceStatus;
  issued: string;
  due: string;
  method: string;
}

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  draft: "ร่างเอกสาร",
  pending_review: "รอตรวจสอบ",
  active: "กำลังดำเนินการ",
  filed: "ยื่นศาลแล้ว",
  completed: "ปิดเคสแล้ว",
};

export const PRIORITY_LABEL: Record<CasePriority, string> = {
  high: "เร่งด่วน",
  medium: "ปกติ",
  low: "ติดตาม",
};

export const CASES: LegalCase[] = [
  {
    id: "C-1042",
    title: "ฉ้อโกงซื้อขายสินค้าออนไลน์",
    categoryLabel: "ภัยออนไลน์",
    status: "active",
    clientName: "สมชาย ใจดี",
    clientId: "c1",
    lawyerName: "ทนายสมหมาย",
    lastUpdate: "12 ส.ค. 2568",
    nextDeadline: "20 ส.ค. 2568",
    priority: "high",
    fee: 12000,
    progress: 65,
    description: "ลูกความสั่งซื้อสินค้าออนไลน์แล้วไม่ได้ของ มูลค่าความเสียหาย 45,000 บาท อยู่ระหว่างรวบรวมหลักฐานและแจ้งความออนไลน์",
    timeline: [
      { date: "2 ส.ค. 2568", title: "รับเคส", description: "ลูกความปรึกษาเรื่องถูกโกงซื้อของออนไลน์", type: "created" },
      { date: "5 ส.ค. 2568", title: "รวบรวมหลักฐาน", description: "สลิปโอนเงิน + แชทสนทนากับผู้ขายครบถ้วน", type: "doc" },
      { date: "8 ส.ค. 2568", title: "แจ้งความออนไลน์", description: "ยื่นเรื่องผ่าน thaipoliceonline.go.th แล้ว", type: "court" },
      { date: "12 ส.ค. 2568", title: "ติดตามคดี", description: "รอหมายเลขคดีจากพนักงานสอบสวน", type: "note" },
    ],
    documents: [
      { name: "สลิปโอนเงิน.pdf", type: "PDF", size: "180 KB", date: "5 ส.ค. 2568" },
      { name: "บันทึกแชทผู้ขาย.pdf", type: "PDF", size: "2.1 MB", date: "5 ส.ค. 2568" },
      { name: "ใบแจ้งความ.pdf", type: "PDF", size: "420 KB", date: "8 ส.ค. 2568" },
    ],
  },
  {
    id: "C-1041",
    title: "เลิกจ้างไม่เป็นธรรม / ค่าชดเชย",
    categoryLabel: "แรงงาน",
    status: "pending_review",
    clientName: "วิภา แสงทอง",
    clientId: "c2",
    lawyerName: "ทนายสมหมาย",
    lastUpdate: "11 ส.ค. 2568",
    nextDeadline: "18 ส.ค. 2568",
    priority: "medium",
    fee: 8000,
    progress: 40,
    description: "ลูกความทำงาน 6 ปี ถูกเลิกจ้างโดยไม่จ่ายค่าชดเชย กำลังจัดทำคำร้องต่อพนักงานตรวจแรงงาน",
    timeline: [
      { date: "3 ส.ค. 2568", title: "รับเคส", description: "ปรึกษากรณีถูกเลิกจ้างไม่เป็นธรรม", type: "created" },
      { date: "7 ส.ค. 2568", title: "ตรวจเอกสาร", description: "สัญญาจ้าง + สลิปเงินเดือน + หนังสือเลิกจ้าง", type: "doc" },
      { date: "11 ส.ค. 2568", title: "ร่างคำร้อง", description: "คำร้องต่อพนักงานตรวจแรงงาน อยู่ระหว่างทบทวน", type: "note" },
    ],
    documents: [
      { name: "หนังสือเลิกจ้าง.pdf", type: "PDF", size: "320 KB", date: "7 ส.ค. 2568" },
      { name: "สัญญาจ้างแรงงาน.pdf", type: "PDF", size: "610 KB", date: "7 ส.ค. 2568" },
    ],
  },
  {
    id: "C-1040",
    title: "ฟ้องหย่าและแบ่งสินสมรส",
    categoryLabel: "ครอบครัว",
    status: "active",
    clientName: "อานันท์ ชื่นใจ",
    clientId: "c3",
    lawyerName: "ทนายสมหมาย",
    lastUpdate: "10 ส.ค. 2568",
    priority: "low",
    fee: 15000,
    progress: 30,
    description: "เจรจาแบ่งสินสมรสและค่าเลี้ยงดูบุตรอย่างละมุน ยังอยู่ในขั้นตอนไกล่เกลี่ยก่อนฟ้อง",
    timeline: [
      { date: "1 ส.ค. 2568", title: "รับเคส", description: "ปรึกษาการหย่าแบบยินยอมพร้อมแบ่งสินสมรส", type: "created" },
      { date: "6 ส.ค. 2568", title: "รวบรวมทรัพย์สิน", description: "รายการสินสมรสครบถ้วน", type: "doc" },
      { date: "10 ส.ค. 2568", title: "นัดไกล่เกลี่ย", description: "รอคู่กรณีตอบรับวันนัด", type: "note" },
    ],
    documents: [
      { name: "ทะเบียนสมรส.pdf", type: "PDF", size: "240 KB", date: "6 ส.ค. 2568" },
      { name: "รายการทรัพย์สิน.xlsx", type: "XLSX", size: "95 KB", date: "6 ส.ค. 2568" },
    ],
  },
  {
    id: "C-1039",
    title: "เคลมประกันรถถูกปฏิเสธ",
    categoryLabel: "ประกันภัย",
    status: "completed",
    clientName: "ประเสริฐ มากมี",
    clientId: "c4",
    lawyerName: "ทนายสมหมาย",
    lastUpdate: "28 ก.ค. 2568",
    priority: "medium",
    fee: 11000,
    progress: 100,
    description: "บริษัทประกันปฏิเสธการเคลมอุบัติเหตุ — ดำเนินการจนได้รับค่าสินไหมครบถ้วนแล้ว",
    timeline: [
      { date: "10 ก.ค. 2568", title: "รับเคส", description: "เคลมประกันรถถูกปฏิเสธ", type: "created" },
      { date: "15 ก.ค. 2568", title: "ยื่นอุทธรณ์", description: "หนังสืออุทธรณ์ต่อบริษัทประกัน", type: "doc" },
      { date: "22 ก.ค. 2568", title: "เจรจาสำเร็จ", description: "บริษัทอนุมัติค่าสินไหม 85,000 บาท", type: "payment" },
      { date: "28 ก.ค. 2568", title: "ปิดเคส", description: "ลูกความได้รับเงินครบถ้วน", type: "note" },
    ],
    documents: [
      { name: "กรมธรรม์ประกันภัย.pdf", type: "PDF", size: "530 KB", date: "10 ก.ค. 2568" },
      { name: "หนังสือปฏิเสธการเคลม.pdf", type: "PDF", size: "290 KB", date: "10 ก.ค. 2568" },
    ],
  },
  {
    id: "C-1038",
    title: "ถูกไล่ออกจากคอนโด / มัดจำไม่คืน",
    categoryLabel: "ที่อยู่อาศัย",
    status: "filed",
    clientName: "น้ำฝน งามพร้อม",
    clientId: "c5",
    lawyerName: "ทนายสมหมาย",
    lastUpdate: "9 ส.ค. 2568",
    nextDeadline: "25 ส.ค. 2568",
    priority: "high",
    fee: 6000,
    progress: 75,
    description: "ผู้ให้เช่าไล่ออกโดยไม่เป็นธรรมและไม่คืนเงินมัดจำ — ยื่นคำร้องต่อคณะกรรมการคุ้มครองผู้เช่าแล้ว",
    timeline: [
      { date: "20 ก.ค. 2568", title: "รับเคส", description: "ถูกไล่ออกและมัดจำไม่คืน 30,000 บาท", type: "created" },
      { date: "25 ก.ค. 2568", title: "รวบรวมหลักฐาน", description: "สัญญาเช่า + ใบเสร็จมัดจำ", type: "doc" },
      { date: "9 ส.ค. 2568", title: "ยื่นคำร้อง", description: "ยื่นต่อคณะกรรมการแล้ว รอนัดไกล่เกลี่ย", type: "court" },
    ],
    documents: [
      { name: "สัญญาเช่าคอนโด.pdf", type: "PDF", size: "780 KB", date: "25 ก.ค. 2568" },
      { name: "ใบเสร็จรับเงินมัดจำ.pdf", type: "PDF", size: "150 KB", date: "25 ก.ค. 2568" },
    ],
  },
  {
    id: "C-1037",
    title: "หนี้บัตรเครดิต / ฟ้องล้มละลาย",
    categoryLabel: "หนี้สิน",
    status: "draft",
    clientName: "ชัยวัฒน์ ยั่งยืน",
    clientId: "c6",
    lawyerName: "ทนายสมหมาย",
    lastUpdate: "8 ส.ค. 2568",
    priority: "low",
    fee: 9000,
    progress: 15,
    description: "เจรจาประนอมหนี้กับธนาคาร อยู่ระหว่างรวบรวมข้อมูลภาระหนี้ทั้งหมด",
    timeline: [
      { date: "5 ส.ค. 2568", title: "รับเคส", description: "ภาระหนี้บัตรเครดิตรวม 3 ธนาคาร", type: "created" },
      { date: "8 ส.ค. 2568", title: "รวบรวมข้อมูลหนี้", description: "อยู่ระหว่างขอข้อมูลหนี้จากธนาคาร", type: "doc" },
    ],
    documents: [
      { name: "รายการหนี้บัตรเครดิต.xlsx", type: "XLSX", size: "110 KB", date: "8 ส.ค. 2568" },
    ],
  },
];

export const CLIENTS: Client[] = [
  { id: "c1", name: "สมชาย ใจดี", email: "somchai@example.com", phone: "081-234-5678", province: "กรุงเทพมหานคร", caseCount: 3, totalSpent: 45000, joined: "มี.ค. 2568", status: "active" },
  { id: "c2", name: "วิภา แสงทอง", email: "wipa@example.com", phone: "089-876-5432", province: "สมุทรปราการ", caseCount: 1, totalSpent: 8000, joined: "ก.ค. 2568", status: "active" },
  { id: "c3", name: "อานันท์ ชื่นใจ", email: "anand@example.com", phone: "086-111-2222", province: "นนทบุรี", caseCount: 2, totalSpent: 30000, joined: "พ.ค. 2568", status: "active" },
  { id: "c4", name: "ประเสริฐ มากมี", email: "prasert@example.com", phone: "082-333-4444", province: "ชลบุรี", caseCount: 1, totalSpent: 11000, joined: "ก.พ. 2568", status: "active" },
  { id: "c5", name: "น้ำฝน งามพร้อม", email: "namfon@example.com", phone: "085-555-6666", province: "กรุงเทพมหานคร", caseCount: 1, totalSpent: 6000, joined: "มิ.ย. 2568", status: "active" },
  { id: "c6", name: "ชัยวัฒน์ ยั่งยืน", email: "chaiwat@example.com", phone: "083-777-8888", province: "ปทุมธานี", caseCount: 1, totalSpent: 9000, joined: "ม.ค. 2568", status: "inactive" },
];

export const INVOICES: Invoice[] = [
  { id: "INV-2048", clientName: "สมชาย ใจดี", caseTitle: "ฉ้อโกงซื้อขายสินค้าออนไลน์", amount: 12000, status: "paid", issued: "12 ส.ค. 2568", due: "19 ส.ค. 2568", method: "PromptPay" },
  { id: "INV-2047", clientName: "วิภา แสงทอง", caseTitle: "เลิกจ้างไม่เป็นธรรม", amount: 8000, status: "pending", issued: "11 ส.ค. 2568", due: "18 ส.ค. 2568", method: "โอนเงิน" },
  { id: "INV-2046", clientName: "อานันท์ ชื่นใจ", caseTitle: "ฟ้องหย่าและแบ่งสินสมรส", amount: 15000, status: "pending", issued: "10 ส.ค. 2568", due: "17 ส.ค. 2568", method: "บัตรเครดิต" },
  { id: "INV-2045", clientName: "ประเสริฐ มากมี", caseTitle: "เคลมประกันรถถูกปฏิเสธ", amount: 11000, status: "paid", issued: "28 ก.ค. 2568", due: "4 ส.ค. 2568", method: "PromptPay" },
  { id: "INV-2044", clientName: "น้ำฝน งามพร้อม", caseTitle: "ถูกไล่ออก / มัดจำไม่คืน", amount: 6000, status: "overdue", issued: "9 ส.ค. 2568", due: "16 ส.ค. 2568", method: "โอนเงิน" },
  { id: "INV-2043", clientName: "ชัยวัฒน์ ยั่งยืน", caseTitle: "หนี้บัตรเครดิต / ล้มละลาย", amount: 9000, status: "pending", issued: "8 ส.ค. 2568", due: "15 ส.ค. 2568", method: "บัตรเครดิต" },
];

/** Helpers for the lawyer dashboard & case pages */
export function getCaseById(id: string): LegalCase | undefined {
  return CASES.find((c) => c.id === id);
}

export function getClientById(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}

export function countByStatus(status: CaseStatus | CaseStatus[]): number {
  const statuses = Array.isArray(status) ? status : [status];
  return CASES.filter((c) => statuses.includes(c.status)).length;
}

export function activeCaseCount(): number {
  return CASES.filter((c) => c.status === "active" || c.status === "filed").length;
}

export function totalEarnings(): number {
  return INVOICES.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
}

export function outstandingAmount(): number {
  return INVOICES.filter((i) => i.status === "pending" || i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);
}
