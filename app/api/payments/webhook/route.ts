/**
 * Chujai Legal — payment webhook route.
 * POST /api/payments/webhook
 * Receives Omise webhook events, verifies the payload, and updates the payment
 * record. Returns 200 on success, 400 on a bad signature/payload.
 */

import { verifyWebhook } from "@/lib/payments/omise";
import { json } from "@/lib/api";
import * as store from "@/lib/mock/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-omise-signature");

  const verified = verifyWebhook(rawBody, signature);
  if (!verified.ok) {
    return json({ error: "ลายเซ็นเว็บฮุกไม่ถูกต้อง" }, { status: 400 });
  }

  const event = verified.event;
  const data = verified.data ?? {};
  const chargeId = String(data.id ?? "");

  if (event === "charge.complete") {
    const payment = store.listPayments().find((p) => p.id === chargeId);
    if (payment) store.updatePayment(chargeId, { status: "successful" });
  } else if (event === "charge.failed") {
    store.updatePayment(chargeId, { status: "failed" });
  }

  return json({ received: true, event });
}
