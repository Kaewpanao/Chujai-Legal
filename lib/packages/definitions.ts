/**
 * Chujai Legal — package tier definitions.
 * 4 tiers with per-tier features and a full comparison matrix.
 * Source: Master Design §Appendix C (Package Tier Definitions).
 */

export type TierId = "free" | "action" | "case_plus" | "sme";

export interface PackageFeatureItem {
  label: string;
  included: boolean;
  /** Optional qualifier, e.g. "3 ครั้ง/เดือน" */
  note?: string;
}

export interface PackageTier {
  id: TierId;
  name: string;
  nameEn: string;
  emoji: string;
  price: number;
  priceSuffix: string;
  tagline: string;
  /** Whether to visually highlight this tier */
  highlight: boolean;
  ctaLabel: string;
  features: PackageFeatureItem[];
}

export interface ComparisonFeature {
  key: string;
  label: string;
  /** Display value per tier (e.g. "✓", "✗", "3 ครั้ง", "ไม่จำกัด") */
  values: Record<TierId, string>;
}

export const PACKAGE_TIERS: PackageTier[] = [
  {
    id: "free",
    name: "ฟรี",
    nameEn: "Free",
    emoji: "🆓",
    price: 0,
    priceSuffix: "",
    tagline: "เริ่มต้นทำความเข้าใจสิทธิของคุณ",
    highlight: false,
    ctaLabel: "เริ่มใช้ฟรี",
    features: [
      { label: "ตรวจวินิจฉัย AI", included: true, note: "3 ครั้ง/เดือน" },
      { label: "ค้นหากฎหมายด้วยภาษาคน", included: true },
      { label: "สร้างเอกสาร", included: true, note: "1 ฉบับ" },
      { label: "คำนวณภาษี (พื้นฐาน)", included: true },
      { label: "ดูข้อมูลทนายความ", included: true },
      { label: "อัปโหลดหลักฐาน", included: false },
      { label: "ขั้นตอนศาลทีละขั้น", included: false },
      { label: "ติดตามคดีอัตโนมัติ", included: false },
      { label: "ปรึกษาทนาย", included: false },
      { label: "เอกสารธุรกิจ", included: false },
    ],
  },
  {
    id: "action",
    name: "Action Pack",
    nameEn: "Action Pack",
    emoji: "⚡",
    price: 299,
    priceSuffix: "ครั้งเดียว",
    tagline: "ลงมือทำเองได้ครบทุกขั้นตอน",
    highlight: true,
    ctaLabel: "ซื้อเลย ฿299",
    features: [
      { label: "ทุกอย่างในแพ็กฟรี", included: true },
      { label: "ตรวจวินิจฉัย AI", included: true, note: "ไม่จำกัด" },
      { label: "สร้างเอกสาร", included: true, note: "ไม่จำกัด" },
      { label: "อัปโหลดหลักฐาน", included: true },
      { label: "ขั้นตอนศาลทีละขั้น", included: true },
      { label: "คำนวณภาษีขั้นสูง", included: true },
      { label: "ส่งออกเอกสารไม่มีลายน้ำ", included: true },
      { label: "ติดตามคดีอัตโนมัติ", included: false },
      { label: "ปรึกษาทนาย", included: false },
      { label: "เอกสารธุรกิจ", included: false },
    ],
  },
  {
    id: "case_plus",
    name: "Case Plus",
    nameEn: "Case Plus",
    emoji: "⭐",
    price: 999,
    priceSuffix: "ครั้งเดียว",
    tagline: "มีผู้ช่วยติดตามและปรึกษาให้อุ่นใจ",
    highlight: false,
    ctaLabel: "ซื้อเลย ฿999",
    features: [
      { label: "ทุกอย่างใน Action Pack", included: true },
      { label: "ติดตามคดีอัตโนมัติ (Timeline)", included: true },
      { label: "แจ้งเตือนอัตโนมัติ", included: true },
      { label: "แจ้งเตือนทาง LINE", included: true },
      { label: "ปรึกษาทนาย", included: true, note: "3 ครั้ง" },
      { label: "Priority Support", included: true },
      { label: "เอกสารธุรกิจ", included: false },
      { label: "ทีม (หลายผู้ใช้)", included: false },
    ],
  },
  {
    id: "sme",
    name: "SME Starter",
    nameEn: "SME Starter",
    emoji: "🏢",
    price: 2990,
    priceSuffix: "/เดือน",
    tagline: "สำหรับธุรกิจและทีมที่ต้องการครบวงจร",
    highlight: false,
    ctaLabel: "ติดต่อเรา",
    features: [
      { label: "ทุกอย่างใน Case Plus", included: true },
      { label: "เอกสารธุรกิจ", included: true },
      { label: "ทีม (หลายผู้ใช้)", included: true, note: "5 คน" },
      { label: "ภาษีนิติบุคคล", included: true },
      { label: "API Access", included: true },
      { label: "ปรึกษาทนาย", included: true, note: "10 ครั้ง/เดือน" },
      { label: "Priority Support", included: true },
    ],
  },
];

export const COMPARISON_MATRIX: ComparisonFeature[] = [
  {
    key: "ai-diagnosis",
    label: "ตรวจวินิจฉัย AI",
    values: { free: "3/เดือน", action: "ไม่จำกัด", case_plus: "ไม่จำกัด", sme: "ไม่จำกัด" },
  },
  {
    key: "ai-search",
    label: "ค้นหากฎหมาย AI",
    values: { free: "✓", action: "✓", case_plus: "✓", sme: "✓" },
  },
  {
    key: "documents",
    label: "สร้างเอกสาร",
    values: { free: "1", action: "ไม่จำกัด", case_plus: "ไม่จำกัด", sme: "ไม่จำกัด" },
  },
  {
    key: "evidence",
    label: "อัปโหลดหลักฐาน",
    values: { free: "✗", action: "✓", case_plus: "✓", sme: "✓" },
  },
  {
    key: "court-steps",
    label: "ขั้นตอนศาลทีละขั้น",
    values: { free: "✗", action: "✓", case_plus: "✓", sme: "✓" },
  },
  {
    key: "timeline",
    label: "ติดตามคดีอัตโนมัติ",
    values: { free: "✗", action: "✗", case_plus: "✓", sme: "✓" },
  },
  {
    key: "reminders",
    label: "แจ้งเตือนอัตโนมัติ",
    values: { free: "✗", action: "✗", case_plus: "✓", sme: "✓" },
  },
  {
    key: "line",
    label: "แจ้งเตือนทาง LINE",
    values: { free: "✗", action: "✗", case_plus: "✓", sme: "✓" },
  },
  {
    key: "lawyer",
    label: "ปรึกษาทนาย",
    values: { free: "✗", action: "✗", case_plus: "3 ครั้ง", sme: "10 ครั้ง/เดือน" },
  },
  {
    key: "business-docs",
    label: "เอกสารธุรกิจ",
    values: { free: "✗", action: "✗", case_plus: "✗", sme: "✓" },
  },
  {
    key: "team",
    label: "ทีม (หลายผู้ใช้)",
    values: { free: "✗", action: "✗", case_plus: "✗", sme: "5 คน" },
  },
  {
    key: "tax-basic",
    label: "คำนวณภาษี (พื้นฐาน)",
    values: { free: "✓", action: "✓", case_plus: "✓", sme: "✓" },
  },
  {
    key: "tax-advanced",
    label: "คำนวณภาษี (ขั้นสูง)",
    values: { free: "✗", action: "✓", case_plus: "✓", sme: "✓" },
  },
  {
    key: "corporate-tax",
    label: "ภาษีนิติบุคคล",
    values: { free: "✗", action: "✗", case_plus: "✗", sme: "✓" },
  },
  {
    key: "api",
    label: "API Access",
    values: { free: "✗", action: "✗", case_plus: "✗", sme: "✓" },
  },
  {
    key: "priority-support",
    label: "Priority Support",
    values: { free: "✗", action: "✗", case_plus: "✓", sme: "✓" },
  },
  {
    key: "watermark",
    label: "ลายน้ำบนเอกสาร",
    values: { free: "✓", action: "ไม่มี", case_plus: "ไม่มี", sme: "ไม่มี" },
  },
];

export const TIER_ORDER: TierId[] = ["free", "action", "case_plus", "sme"];

export function getTier(id: TierId): PackageTier {
  return PACKAGE_TIERS.find((t) => t.id === id) ?? PACKAGE_TIERS[0];
}
