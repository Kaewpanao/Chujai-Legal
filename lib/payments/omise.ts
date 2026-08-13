/**
 * Chujai Legal — Omise payment wrapper.
 *
 * Real Omise API calls when `OMISE_SECRET_KEY` is set; graceful mock fallback
 * otherwise. Covers PromptPay sources (QR), charges, and webhook verification.
 *
 * Env:
 *   OMISE_PUBLIC_KEY      — client-side key (PromptPay/credit card)
 *   OMISE_SECRET_KEY      — server-side key (charges/sources)
 *   OMISE_WEBHOOK_SECRET  — optional shared secret for webhook HMAC
 */

import { createHmac } from "crypto";

const OMISE_API = "https://api.omise.co";

export interface OmiseSource {
  id: string;
  type: string;
  amount: number;
  currency: string;
  qr?: string;
  status?: string;
}

export interface OmiseCharge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid: boolean;
  sourceId?: string;
  failureMessage?: string;
}

export interface OmiseResult<T = unknown> {
  data: T | null;
  error?: string;
  mock?: boolean;
}

export function isOmiseConfigured(): boolean {
  return Boolean(process.env.OMISE_SECRET_KEY);
}

function authHeader(): string {
  const key = process.env.OMISE_SECRET_KEY ?? "";
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

/**
 * Create a PromptPay source (QR payment). `amount` is in satang (1 THB = 100).
 */
export async function createPromptPaySource(
  amountSatang: number,
): Promise<OmiseResult<OmiseSource>> {
  if (!isOmiseConfigured()) {
    return {
      data: mockSource(amountSatang),
      mock: true,
      error: undefined,
    };
  }
  try {
    const res = await fetch(`${OMISE_API}/sources`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        type: "promptpay",
        amount: String(amountSatang),
        currency: "THB",
      }),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return { data: null, error: json.message as string | undefined };
    }
    const qr = extractQrUri(json);
    return {
      data: {
        id: String(json.id ?? ""),
        type: "promptpay",
        amount: Number(json.amount ?? 0),
        currency: String(json.currency ?? "THB"),
        qr,
        status: String(json.status ?? "pending"),
      },
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "network error" };
  }
}

/**
 * Create a charge from an existing source (e.g. after the customer scans the
 * PromptPay QR). `amount` in satang.
 */
export async function createCharge(
  amountSatang: number,
  sourceId: string,
  metadata?: Record<string, string>,
): Promise<OmiseResult<OmiseCharge>> {
  if (!isOmiseConfigured()) {
    return {
      data: {
        id: `chrg_mock_${Date.now()}`,
        amount: amountSatang,
        currency: "THB",
        status: "pending",
        paid: false,
        sourceId,
      },
      mock: true,
    };
  }
  try {
    const body = new URLSearchParams({
      amount: String(amountSatang),
      currency: "THB",
      source: sourceId,
    });
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => body.set(`metadata[${k}]`, v));
    }
    const res = await fetch(`${OMISE_API}/charges`, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return { data: null, error: json.message as string | undefined };
    }
    return {
      data: {
        id: String(json.id ?? ""),
        amount: Number(json.amount ?? 0),
        currency: String(json.currency ?? "THB"),
        status: String(json.status ?? "pending"),
        paid: Boolean(json.paid ?? false),
        sourceId,
        failureMessage: json.failure_message
          ? String(json.failure_message)
          : undefined,
      },
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "network error" };
  }
}

/** Retrieve a charge by id (used by /verify). */
export async function retrieveCharge(chargeId: string): Promise<OmiseResult<OmiseCharge>> {
  if (!isOmiseConfigured()) {
    return {
      data: mockCharge(chargeId),
      mock: true,
    };
  }
  try {
    const res = await fetch(`${OMISE_API}/charges/${chargeId}`, {
      headers: { Authorization: authHeader() },
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return { data: null, error: json.message as string | undefined };
    }
    return {
      data: {
        id: String(json.id ?? chargeId),
        amount: Number(json.amount ?? 0),
        currency: String(json.currency ?? "THB"),
        status: String(json.status ?? "unknown"),
        paid: Boolean(json.paid ?? false),
        failureMessage: json.failure_message
          ? String(json.failure_message)
          : undefined,
      },
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "network error" };
  }
}

/**
 * Verify an Omise webhook payload. Omise does not sign webhooks by default;
 * when `OMISE_WEBHOOK_SECRET` is set we verify an HMAC signature header.
 */
export function verifyWebhook(
  rawBody: string,
  signature?: string | null,
): { ok: boolean; event?: string; data?: Record<string, unknown> } {
  const secret = process.env.OMISE_WEBHOOK_SECRET;
  if (secret) {
    const expected = createHmacSignature(secret, rawBody);
    if (!signature || signature !== expected) {
      return { ok: false };
    }
  }

  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    return {
      ok: true,
      event: payload.event ? String(payload.event) : undefined,
      data: (payload.data ?? {}) as Record<string, unknown>,
    };
  } catch {
    return { ok: false };
  }
}

/* ----------------------------- mock helpers ------------------------------ */

function mockSource(amountSatang: number): OmiseSource {
  return {
    id: `src_mock_${Date.now()}`,
    type: "promptpay",
    amount: amountSatang,
    currency: "THB",
    qr: "https://example.com/mock-promptpay-qr.png",
    status: "pending",
  };
}

function mockCharge(chargeId: string): OmiseCharge {
  return {
    id: chargeId || `chrg_mock_${Date.now()}`,
    amount: 0,
    currency: "THB",
    status: "successful",
    paid: true,
  };
}

function createHmacSignature(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function extractQrUri(json: Record<string, unknown>): string | undefined {
  const scannable = (json.scannable_code ?? {}) as Record<string, unknown>;
  const image = (scannable.image ?? {}) as Record<string, unknown>;
  const downloads = image.download_uri;
  return downloads ? String(downloads) : undefined;
}
