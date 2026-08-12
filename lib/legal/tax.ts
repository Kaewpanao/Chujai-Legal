/**
 * Chujai Legal — Thai personal income tax calculator.
 * Progressive brackets + common deductions. For educational estimation only.
 * Source: ประมวลรัษฎากร (Revenue Code) — มาตรา 40, 47.
 */

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

/** Thai personal income tax brackets (net income, ฿/ปี). */
export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 150_000, rate: 0 },
  { min: 150_001, max: 300_000, rate: 0.05 },
  { min: 300_001, max: 500_000, rate: 0.1 },
  { min: 500_001, max: 750_000, rate: 0.15 },
  { min: 750_001, max: 1_000_000, rate: 0.2 },
  { min: 1_000_001, max: 2_000_000, rate: 0.25 },
  { min: 2_000_001, max: 5_000_000, rate: 0.3 },
  { min: 5_000_001, max: Number.POSITIVE_INFINITY, rate: 0.35 },
];

export interface TaxDeduction {
  id: string;
  label: string;
  /** Max deductible amount (฿) for a single unit */
  max: number;
  note?: string;
  /** Default checked for a typical salaried worker */
  defaultChecked: boolean;
}

export const TAX_DEDUCTIONS: TaxDeduction[] = [
  { id: "personal", label: "ค่าลดหย่อนส่วนตัว", max: 60_000, defaultChecked: true },
  { id: "expense", label: "ค่าใช้จ่าย (รายได้เงินเดือน 50%)", max: 100_000, defaultChecked: true, note: "สูงสุด 100,000 บาท" },
  { id: "social", label: "ประกันสังคม", max: 9_000, defaultChecked: true },
  { id: "spouse", label: "คู่สมรส (ไม่มีรายได้)", max: 60_000, defaultChecked: false },
  { id: "child", label: "บุตร (ต่อคน)", max: 30_000, defaultChecked: false },
  { id: "parent", label: "บิดา–มารดา (ต่อคน)", max: 30_000, defaultChecked: false },
  { id: "health", label: "ประกันสุขภาพ", max: 25_000, defaultChecked: false },
  { id: "life", label: "ประกันชีวิต", max: 100_000, defaultChecked: false },
  { id: "rmf", label: "กองทุน RMF", max: 500_000, defaultChecked: false, note: "ไม่เกิน 30% ของรายได้" },
  { id: "ssf", label: "กองทุน SSF", max: 200_000, defaultChecked: false, note: "ไม่เกิน 30% ของรายได้" },
];

export interface TaxResult {
  /** Gross annual income */
  income: number;
  /** Total deductions applied */
  deductions: number;
  /** Net taxable income */
  netIncome: number;
  /** Computed tax */
  tax: number;
  /** Effective tax rate (tax / income) */
  effectiveRate: number;
}

function progressiveTax(net: number): number {
  let remaining = net;
  let tax = 0;
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const span = Math.max(0, Math.min(remaining, bracket.max) - bracket.min + 1);
    if (span > 0) {
      tax += span * bracket.rate;
      remaining -= span;
    }
  }
  return tax;
}

/**
 * Compute estimated personal income tax.
 * `selectedIds` are the deduction ids the user has checked (single unit each).
 */
export function calculateTax(
  income: number,
  selectedIds: string[],
): TaxResult {
  const safeIncome = Math.max(0, Math.floor(income));
  const selected = new Set(selectedIds);

  let deductions = 0;

  for (const d of TAX_DEDUCTIONS) {
    if (!selected.has(d.id)) continue;
    if (d.id === "expense") {
      // Salary expense deduction: 50% of income, capped at 100,000.
      deductions += Math.min(d.max, Math.floor(safeIncome * 0.5));
    } else {
      deductions += d.max;
    }
  }

  // Deductions cannot exceed income.
  deductions = Math.min(deductions, safeIncome);
  const netIncome = Math.max(0, safeIncome - deductions);
  const tax = progressiveTax(netIncome);
  const effectiveRate = safeIncome > 0 ? tax / safeIncome : 0;

  return { income: safeIncome, deductions, netIncome, tax, effectiveRate };
}

export function formatBahtAmount(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(value);
}
