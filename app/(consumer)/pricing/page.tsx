"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  PACKAGE_TIERS,
  COMPARISON_MATRIX,
  TIER_ORDER,
  getTier,
  type TierId,
} from "@/lib/packages/definitions";
import { formatBaht, cn } from "@/lib/utils";

type PayStep = "intro" | "processing" | "qr" | "done";

export default function PricingPage() {
  const [payOpen, setPayOpen] = useState(false);
  const [payTier, setPayTier] = useState<TierId>("action");
  const [payStep, setPayStep] = useState<PayStep>("intro");
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [payMock, setPayMock] = useState(false);
  const [payError, setPayError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const tier = getTier(payTier);

  function openPayment(t: TierId) {
    if (t === "free" || t === "sme") return;
    setPayTier(t);
    setPayStep("intro");
    setChargeId(null);
    setQrUrl(null);
    setPayError("");
    setPayOpen(true);
  }

  async function createPayment() {
    setPayStep("processing");
    setPayError("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: tier.price,
          packageId: tier.id,
          description: `${tier.name} — Chujai Legal`,
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        payment?: { id: string; qr?: string };
        mock?: boolean;
      };
      if (!res.ok || !body.payment) {
        throw new Error(body.error ?? "สร้างรายการชำระเงินไม่สำเร็จ");
      }
      setChargeId(body.payment.id);
      setQrUrl(body.payment.qr ?? null);
      setPayMock(Boolean(body.mock));
      setPayStep("qr");
      startPolling(body.payment.id);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "สร้างรายการชำระเงินไม่สำเร็จ");
      setPayStep("intro");
    }
  }

  function startPolling(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => void verifyPayment(id), 3000);
  }

  async function verifyPayment(id: string) {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chargeId: id }),
      });
      const body = (await res.json()) as { payment?: { paid?: boolean } };
      if (body.payment?.paid) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPayStep("done");
      }
    } catch {
      /* keep polling */
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="text-center">
        <Badge variant="info" icon="💎" className="mb-2">แพ็กเกจชูใจ</Badge>
        <h2 className="text-xl font-semibold text-ink md:text-2xl">
          เลือกแพ็กเกจที่เหมาะกับเรื่องของคุณ
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-muted">
          เริ่มต้นฟรี — จ่ายเมื่ออยากลงมือทำจริง ไม่มีค่าใช้จ่ายแอบแฝง ยกเลิกได้ตลอด
        </p>
      </div>

      {/* 4 tier cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGE_TIERS.map((t) => (
          <Card
            key={t.id}
            variant="base"
            className={cn(
              "relative flex flex-col",
              t.highlight && "border-2 border-blue shadow-lg",
            )}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-blue px-3 py-1 text-xs font-semibold text-white">
                แนะนำ
              </span>
            )}
            <CardContent className="flex flex-1 flex-col gap-3 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">{t.emoji}</span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{t.name}</h3>
                  <p className="text-xs text-muted">{t.nameEn}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-ink">
                  {t.price === 0 ? "฿0" : formatBaht(t.price)}
                </span>
                {t.priceSuffix && (
                  <span className="text-sm text-muted">/{t.priceSuffix}</span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-muted">{t.tagline}</p>

              <ul className="flex flex-col gap-1.5">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink/85">
                    <span aria-hidden="true">{f.included ? "✅" : "🚫"}</span>
                    <span className={f.included ? "" : "text-muted/60"}>
                      {f.label}
                      {f.note && <span className="text-xs text-muted"> ({f.note})</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2">
                {t.id === "free" ? (
                  <Link href="/concierge" className="block">
                    <Button variant="secondary" className="w-full" size="lg">
                      {t.ctaLabel}
                    </Button>
                  </Link>
                ) : t.id === "sme" ? (
                  <Button variant="secondary" className="w-full" size="lg">
                    {t.ctaLabel}
                  </Button>
                ) : (
                  <Button
                    variant={t.highlight ? "upgrade" : "secondary"}
                    className="w-full"
                    size="lg"
                    onClick={() => openPayment(t.id)}
                  >
                    {t.ctaLabel}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison table */}
      <section aria-label="ตารางเปรียบเทียบแพ็กเกจ">
        <h3 className="mb-3 text-lg font-semibold text-ink">เปรียบเทียบฟีเจอร์ทั้งหมด</h3>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas">
                <th className="px-4 py-3 text-left font-semibold text-ink">ฟีเจอร์</th>
                {TIER_ORDER.map((id) => (
                  <th key={id} className="px-4 py-3 text-center font-semibold text-ink">
                    {getTier(id).emoji} {getTier(id).name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_MATRIX.map((row, i) => (
                <tr key={row.key} className={i % 2 ? "bg-canvas/40" : ""}>
                  <td className="px-4 py-2.5 text-ink/85">{row.label}</td>
                  {TIER_ORDER.map((id) => {
                    const v = row.values[id];
                    const isCheck = v === "✓";
                    const isCross = v === "✗";
                    return (
                      <td key={id} className="px-4 py-2.5 text-center">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                            isCheck ? "bg-green/10 text-green" : isCross ? "bg-gray-100 text-muted" : "bg-blue-50 text-blue-dark",
                          )}
                        >
                          {v}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="max-w-lg text-sm text-muted">
          💡 ทุกแพ็กเกจเริ่มได้ฟรี และเราจะไม่เรียกเก็บเงินโดยที่คุณไม่รู้ตัว —
          เลือกจ่ายเฉพาะเมื่อพร้อมลงมือทำจริงเท่านั้น
        </p>
        <LegalDisclaimer className="max-w-lg" />
        <Link href="/profile" className="text-sm font-medium text-blue hover:underline">
          ดูแพ็กเกจปัจจุบันของฉัน →
        </Link>
      </div>

      {/* PAYMENT MODAL — PromptPay */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <Card variant="base" className="w-full max-w-md">
            <CardContent className="flex flex-col gap-4 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">
                    {tier.emoji} {tier.name} — {formatBaht(tier.price)}
                  </h3>
                  <p className="text-sm text-muted">{tier.tagline}</p>
                </div>
                <button type="button" onClick={() => setPayOpen(false)} className="text-muted hover:text-ink" aria-label="ปิด">
                  ✕
                </button>
              </div>

              {payStep === "intro" && (
                <>
                  <ul className="flex flex-col gap-1.5 text-sm text-ink/85">
                    {tier.features.filter((f) => f.included).map((f, i) => (
                      <li key={i}>✅ {f.label}{f.note ? ` (${f.note})` : ""}</li>
                    ))}
                  </ul>
                  {payError && <p className="rounded-lg bg-red/10 px-3 py-2 text-xs text-red">{payError}</p>}
                  <Button variant="upgrade" size="lg" className="w-full" onClick={createPayment}>
                    💳 จ่ายด้วย PromptPay
                  </Button>
                </>
              )}

              {payStep === "processing" && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <LoadingSpinner label="กำลังสร้าง QR ชำระเงิน..." />
                </div>
              )}

              {(payStep === "qr" || payStep === "done") && (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <div className="grid h-48 w-48 place-items-center rounded-2xl border-2 border-line bg-white">
                      {qrUrl && !payMock ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrUrl} alt="PromptPay QR" className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <span className="text-5xl" aria-hidden="true">📱</span>
                          <span className="text-xs font-semibold text-ink">QR PromptPay</span>
                          <span className="px-2 text-[10px] leading-tight text-muted">
                            {payMock ? "โหมดทดสอบ (ยังไม่ได้เชื่อม Omise)" : "สแกนเพื่อชำระเงิน"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-sm font-semibold text-ink">{formatBaht(tier.price)}</p>
                    {chargeId && <p className="text-center text-xs text-muted">รหัส: {chargeId}</p>}
                    {payStep === "qr" && (
                      <p className="text-center text-xs text-muted">
                        สแกนจ่ายแล้วระบบจะตรวจสอบให้อัตโนมัติ
                      </p>
                    )}
                    {payStep === "done" && (
                      <p className="rounded-lg bg-green/10 px-3 py-2 text-xs text-green">
                        ✅ ชำระเงินสำเร็จ! แพ็กเกจของคุณพร้อมใช้งานแล้ว
                      </p>
                    )}
                  </div>
                  {payStep === "qr" && (
                    <Button variant="secondary" className="w-full" onClick={() => void (chargeId && verifyPayment(chargeId))}>
                      ตรวจสอบสถานะการชำระ
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
