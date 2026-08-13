/**
 * Chujai Legal — create payment intent route.
 * POST /api/payments/create
 * Creates a PromptPay source + charge via Omise; falls back to a mock intent
 * when Omise is not configured.
 *
 * Body: { amount: number (THB), packageId?: string, description?: string }
 */

import {
  createCharge,
  createPromptPaySource,
} from "@/lib/payments/omise";
import { bearerToken, error, json, readJson } from "@/lib/api";
import * as store from "@/lib/mock/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreatePaymentBody {
  amount?: number;
  packageId?: string;
  description?: string;
}

export async function POST(req: Request) {
  const body = await readJson<CreatePaymentBody>(req);
  const amount = body?.amount;

  if (typeof amount !== "number" || amount <= 0) {
    return error("กรุณาระบุจำนวนเงิน (amount) เป็นบาทที่มากกว่า 0", 400);
  }

  const amountSatang = Math.round(amount * 100);
  const packageId = body?.packageId;
  const description = body?.description ?? `ชำระเงิน Chujai Legal${packageId ? ` — ${packageId}` : ""}`;

  // 1) Create a PromptPay source.
  const source = await createPromptPaySource(amountSatang);
  if (source.error || !source.data) {
    return error(source.error ?? "สร้าง QR ชำระเงินล้มเหลว", 502);
  }

  // 2) Create a charge against that source.
  const charge = await createCharge(amountSatang, source.data.id, {
    package_id: packageId ?? "",
    description,
  });
  if (charge.error || !charge.data) {
    return error(charge.error ?? "สร้างรายการชำระเงินล้มเหลว", 502);
  }

  const userId = bearerToken(req) ?? "usr_anonymous";

  // Persist a local payment record (mock store; Supabase in production).
  store.createPayment({
    amount: amountSatang,
    currency: "THB",
    status: "pending",
    packageId,
  });

  return json({
    payment: {
      id: charge.data.id,
      amount: amountSatang / 100,
      currency: charge.data.currency,
      status: charge.data.status,
      paid: charge.data.paid,
      qr: source.data.qr,
    },
    mock: Boolean(source.mock || charge.mock),
  });
}
