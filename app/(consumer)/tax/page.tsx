"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  TAX_DEDUCTIONS,
  TAX_BRACKETS,
  calculateTax,
  formatBahtAmount,
  type TaxResult,
} from "@/lib/legal/tax";
import { formatBaht } from "@/lib/utils";
import { cn } from "@/lib/utils";

type CalcState = "idle" | "loading" | "success" | "error";

export default function TaxPage() {
  const [income, setIncome] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(TAX_DEDUCTIONS.filter((d) => d.defaultChecked).map((d) => d.id)),
  );
  const [state, setState] = useState<CalcState>("idle");
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(income.replace(/,/g, ""));
    if (!income.trim() || Number.isNaN(value) || value < 0) {
      setState("error");
      setError("กรุณากรอกรายได้ต่อปีเป็นตัวเลขที่ถูกต้อง (เช่น 600000)");
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setState("loading");
    setError("");
    timer.current = setTimeout(() => {
      setResult(calculateTax(value, Array.from(selected)));
      setState("success");
    }, 600);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">คำนวณภาษีเงินได้บุคคลธรรมดา 💸</h2>
        <p className="text-sm text-muted">
          ประเมินภาษีคร่าว ๆ จากรายได้และค่าลดหย่อน — อ้างอิงตามประมวลรัษฎากร มาตรา 40 และ 47
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Input form */}
        <Card variant="base">
          <CardHeader>
            <CardTitle>รายได้และค่าลดหย่อน</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              <div>
                <label htmlFor="income" className="mb-1.5 block text-sm font-semibold text-ink">
                  รายได้รวมต่อปี (บาท)
                </label>
                <Input
                  id="income"
                  inputMode="numeric"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="เช่น 600000"
                  className="max-w-xs"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-ink">ค่าลดหย่อนที่ใช้</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TAX_DEDUCTIONS.map((d) => {
                    const checked = selected.has(d.id);
                    return (
                      <label
                        key={d.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors",
                          checked ? "border-blue bg-blue-50/60" : "border-line bg-white hover:border-blue/40",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(d.id)}
                          className="mt-0.5 h-4 w-4 accent-blue"
                        />
                        <span className="flex flex-col">
                          <span className="text-sm font-medium text-ink">{d.label}</span>
                          <span className="text-xs text-muted">
                            สูงสุด {formatBaht(d.max)} {d.note ? `· ${d.note}` : ""}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" size="lg" disabled={state === "loading"}>
                {state === "loading" ? "กำลังคำนวณ..." : "คำนวณภาษี"}
              </Button>
            </form>

            {state === "error" && (
              <p className="rounded-xl bg-red/10 px-4 py-3 text-sm text-red" role="alert">
                😕 {error}
              </p>
            )}

            {state === "loading" && (
              <div className="flex justify-center py-4">
                <LoadingSpinner label="กำลังคำนวณภาษีของคุณ..." />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result card */}
        <Card variant={state === "success" ? "base" : "base"} className="h-fit">
          <CardHeader>
            <CardTitle>ผลการคำนวณ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {state === "idle" && (
              <p className="py-6 text-center text-sm text-muted">
                กรอกข้อมูลด้านซ้ายแล้วกด “คำนวณภาษี” เพื่อดูผลลัพธ์นะคะ
              </p>
            )}

            {state === "success" && result && (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl gradient-blue p-5 text-center text-white">
                  <p className="text-xs text-white/80">ภาษีที่ต้องชำระโดยประมาณ</p>
                  <p className="mt-1 text-3xl font-semibold">{formatBaht(Math.round(result.tax))}</p>
                  <p className="mt-1 text-xs text-white/80">
                    อัตราภาษีที่แท้จริง {result.effectiveRate.toFixed(1)}%
                  </p>
                </div>

                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">รายได้รวม</dt>
                    <dd className="font-medium text-ink">{formatBaht(result.income)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">ค่าลดหย่อนรวม</dt>
                    <dd className="font-medium text-ink">− {formatBaht(result.deductions)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2">
                    <dt className="font-semibold text-ink">เงินได้สุทธิ</dt>
                    <dd className="font-semibold text-ink">{formatBaht(result.netIncome)}</dd>
                  </div>
                </dl>

                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">อัตราภาษีขั้นบันได</p>
                  {TAX_BRACKETS.map((b, i) => {
                    const pct = Math.max(0, Math.min(100, ((result.netIncome - b.min) / (b.max - b.min || result.netIncome + 1)) * 100));
                    const active = result.netIncome >= b.min;
                    return (
                      <div key={i} className="mb-1.5 flex items-center gap-2">
                        <span className={cn("w-24 text-xs", active ? "font-medium text-ink" : "text-muted/60")}>
                          {formatBahtAmount(b.min)}+
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                          <div
                            className={cn("h-full rounded-full", active ? "gradient-blue" : "bg-line")}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className={cn("w-10 text-right text-xs", active ? "font-medium text-ink" : "text-muted/60")}>
                          {(b.rate * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-amber/10 px-3 py-2 text-xs text-amber">
              ⚠️ ผลลัพธ์นี้เป็นเพียงการประมาณเพื่อการศึกษา ไม่ใช่คำแนะนำทางภาษีเฉพาะราย
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="info">📖 อ้างอิง</Badge>
          <span className="text-xs text-muted">
            ประมวลรัษฎากร มาตรา 40 (เงินได้พึงประเมิน) และมาตรา 47 (การหักลดหย่อน) — ข้อมูล ณ ปีภาษีล่าสุด
          </span>
        </div>
        <LegalDisclaimer />
        <Link href="/pricing" className="text-xs font-medium text-blue hover:underline">
          💎 อยากได้คำนวณภาษีขั้นสูงและภาษีนิติบุคคล? ดูแพ็กเกจ →
        </Link>
      </div>
    </div>
  );
}
