import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  PACKAGE_TIERS,
  COMPARISON_MATRIX,
  TIER_ORDER,
  getTier,
} from "@/lib/packages/definitions";
import { formatBaht, cn } from "@/lib/utils";

export default function PricingPage() {
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
        {PACKAGE_TIERS.map((tier) => (
          <Card
            key={tier.id}
            variant={tier.highlight ? "base" : "base"}
            className={cn(
              "relative flex flex-col",
              tier.highlight && "border-2 border-blue shadow-lg",
            )}
          >
            {tier.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-blue px-3 py-1 text-xs font-semibold text-white">
                แนะนำ
              </span>
            )}
            <CardContent className="flex flex-1 flex-col gap-3 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">{tier.emoji}</span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{tier.name}</h3>
                  <p className="text-xs text-muted">{tier.nameEn}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-ink">
                  {tier.price === 0 ? "฿0" : formatBaht(tier.price)}
                </span>
                {tier.priceSuffix && (
                  <span className="text-sm text-muted">/{tier.priceSuffix}</span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-muted">{tier.tagline}</p>

              <ul className="flex flex-col gap-1.5">
                {tier.features.map((f, i) => (
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
                <Button variant={tier.highlight ? "upgrade" : "secondary"} className="w-full" size="lg">
                  {tier.ctaLabel}
                </Button>
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
    </div>
  );
}
