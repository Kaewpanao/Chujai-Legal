/**
 * Chujai Legal — verify payment route.
 * POST /api/payments/verify
 * Retrieves a charge by id from Omise (or the mock store) and returns its
 * current status.
 *
 * Body: { chargeId: string }
 */

import { retrieveCharge } from "@/lib/payments/omise";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VerifyBody {
  chargeId?: string;
}

export async function POST(req: Request) {
  const body = await readJson<VerifyBody>(req);
  const chargeId = body?.chargeId?.trim();
  if (!chargeId) return error("กรุณาระบุ chargeId", 400);

  const result = await retrieveCharge(chargeId);
  if (result.error || !result.data) {
    return error(result.error ?? "ไม่พบรายการชำระเงิน", 404);
  }

  return json({
    payment: {
      id: result.data.id,
      amount: result.data.amount / 100,
      currency: result.data.currency,
      status: result.data.status,
      paid: result.data.paid,
      failureMessage: result.data.failureMessage,
    },
    mock: Boolean(result.mock),
  });
}
