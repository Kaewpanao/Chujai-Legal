/**
 * Chujai Legal — lawyer marketplace sample data.
 * Presented objectively (no ranking) per guardrail "no-lawyer-ranking":
 * show expertise, reviews, and price; let the user choose.
 */

export interface Lawyer {
  id: string;
  name: string;
  specialtyId: string; // maps to lib/legal/categories.ts ids
  specialtyLabel: string;
  rating: number;
  reviewCount: number;
  /** Consultation fee (฿/ชั่วโมง) */
  priceConsult: number;
  /** Flat fee for a simple case (฿) */
  priceCase: number;
  years: number;
  province: string;
  verified: boolean;
  bio: string;
}

export const LAWYERS: Lawyer[] = [
  { id: "l1", name: "ทนายปริญญา ใจดี", specialtyId: "online_fraud", specialtyLabel: "ภัยออนไลน์", rating: 4.9, reviewCount: 182, priceConsult: 1500, priceCase: 12000, years: 12, province: "กรุงเทพฯ", verified: true, bio: "เชี่ยวชาญคดีฉ้อโกงออนไลน์และอาชญากรรมไซเบอร์" },
  { id: "l2", name: "ทนายอรุณี รักธรรม", specialtyId: "labour", specialtyLabel: "แรงงาน", rating: 4.8, reviewCount: 241, priceConsult: 1200, priceCase: 8000, years: 15, province: "สมุทรปราการ", verified: true, bio: "ดูแลคดีแรงงานให้ลูกจ้างและนายจ้างมากว่า 15 ปี" },
  { id: "l3", name: "ทนายสมชาย มั่นคง", specialtyId: "family", specialtyLabel: "ครอบครัว", rating: 4.7, reviewCount: 96, priceConsult: 1800, priceCase: 15000, years: 18, province: "นนทบุรี", verified: true, bio: "คดีครอบครัว หย่าร้าง สินสมรส ด้วยความละมุน" },
  { id: "l4", name: "ทนายกมล ทรัพย์ทวี", specialtyId: "property", specialtyLabel: "ที่ดินและทรัพย์สิน", rating: 4.9, reviewCount: 134, priceConsult: 2000, priceCase: 20000, years: 20, province: "ปทุมธานี", verified: true, bio: "เชี่ยวชาญโฉนด มรดก และการซื้อขายที่ดิน" },
  { id: "l5", name: "ทนายณัฐพร ยุติธรรม", specialtyId: "consumer", specialtyLabel: "ผู้บริโภค", rating: 4.6, reviewCount: 78, priceConsult: 1000, priceCase: 6000, years: 8, province: "กรุงเทพฯ", verified: true, bio: "ช่วยผู้บริโภคทวงสิทธิจากผู้ประกอบการ" },
  { id: "l6", name: "ทนายวิชัย กู้ภัยหนี้", specialtyId: "debt", specialtyLabel: "หนี้สิน", rating: 4.8, reviewCount: 210, priceConsult: 1300, priceCase: 9000, years: 14, province: "ชลบุรี", verified: true, bio: "เจรจาหนี้และคดีล้มละลาย ช่วยหาทางออกอย่างเป็นระบบ" },
  { id: "l7", name: "ทนายสุพัตรา ปลอดภัย", specialtyId: "accident", specialtyLabel: "อุบัติเหตุ", rating: 4.7, reviewCount: 152, priceConsult: 1400, priceCase: 10000, years: 10, province: "กรุงเทพฯ", verified: true, bio: "เรียกร้องค่าเสียหายจากอุบัติเหตุและประกันภัย" },
  { id: "l8", name: "ทนายธนกร รับประกัน", specialtyId: "insurance", specialtyLabel: "ประกันภัย", rating: 4.5, reviewCount: 61, priceConsult: 1600, priceCase: 11000, years: 9, province: "นครราชสีมา", verified: false, bio: "ช่วยเคลมประกันที่ถูกปฏิเสธอย่างเป็นธรรม" },
];

export const LAWYER_PROVINCES = Array.from(
  new Set(LAWYERS.map((l) => l.province)),
);

export const LAWYER_SPECIALTIES = Array.from(
  new Set(LAWYERS.map((l) => ({ id: l.specialtyId, label: l.specialtyLabel }))),
);

/** Present rating as Thai text, e.g. "4.9" */
export function ratingText(rating: number): string {
  return rating.toFixed(1);
}
