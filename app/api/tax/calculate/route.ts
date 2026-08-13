/**
 * Chujai Legal — tax calculation route.
 * POST /api/tax/calculate
 * Computes Thai personal income tax from income + selected deductions,
 * citing ประมวลรัษฎากร (Revenue Code) มาตรา 40 / 47.
 *
 * Body: { income: number, deductions?: string[] }
 */

import { calculateTax, TAX_BRACKETS } from "@/lib/legal/tax";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CalculateBody {
  income?: number;
  deductions?: string[];
}

export async function POST(req: Request) {
  const body = await readJson<CalculateBody>(req);
  const income = body?.income;

  if (typeof income !== "number" || income < 0) {
    return error("กรุณาระบุรายได้ (income) เป็นตัวเลขที่มากกว่าหรือเท่ากับ 0", 400);
  }

  const deductions = body?.deductions ?? [];
  const result = calculateTax(income, deductions);

  return json({
    result,
    brackets: TAX_BRACKETS,
    source: {
      lawName: "ประมวลรัษฎากร",
      ref: "มาตรา 40, 47",
      label: "เงินได้พึงประเมินและการหักลดหย่อน",
    },
    disclaimer:
      "ตัวเลขนี้เป็นเพียงการประมาณเพื่อการศึกษาเท่านั้น โปรดตรวจสอบกับสรรพากรหรือผู้เชี่ยวชาญด้านภาษี",
  });
}
