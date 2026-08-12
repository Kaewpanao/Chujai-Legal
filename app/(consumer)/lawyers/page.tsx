"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LAWYERS, LAWYER_PROVINCES, LAWYER_SPECIALTIES } from "@/lib/lawyers";
import { formatBaht } from "@/lib/utils";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "ready" | "error";
type SortKey = "rating" | "price" | "years";

export default function LawyersPage() {
  const [load, setLoad] = useState<LoadState>("loading");
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("rating");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setLoad("ready"), 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = LAWYERS.filter((l) => {
      const matchQ = !q || l.name.toLowerCase().includes(q) || l.bio.toLowerCase().includes(q);
      const matchS = !specialty || l.specialtyId === specialty;
      const matchP = !province || l.province === province;
      return matchQ && matchS && matchP;
    });
    return [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "price") return a.priceConsult - b.priceConsult;
      return b.years - a.years;
    });
  }, [query, specialty, province, sort]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">ค้นหาทนายความ ⚖️</h2>
        <p className="text-sm text-muted">
          เราแสดงข้อมูลทนายอย่างเป็นกลาง ไม่จัดอันดับ — คุณเลือกคนที่เหมาะกับเคสของคุณเองได้เลย
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <label htmlFor="lawyer-search" className="sr-only">
          ค้นหาทนายความ
        </label>
        <Input
          id="lawyer-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อทนายหรือความเชี่ยวชาญ..."
          className="max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">เชี่ยวชาญ:</span>
          {LAWYER_SPECIALTIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSpecialty(specialty === s.id ? null : s.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                specialty === s.id ? "border-blue bg-blue text-white" : "border-line bg-white text-ink/80 hover:border-blue/40",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">จังหวัด:</span>
          <select
            value={province ?? ""}
            onChange={(e) => setProvince(e.target.value || null)}
            className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-blue"
          >
            <option value="">ทั้งหมด</option>
            {LAWYER_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <span className="ml-auto text-xs font-semibold text-muted">เรียงตาม:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-blue"
          >
            <option value="rating">คะแนนรีวิว</option>
            <option value="price">ค่าปรึกษาต่ำสุด</option>
            <option value="years">ประสบการณ์</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {load === "loading" && (
        <Card variant="base">
          <CardContent className="flex items-center justify-center py-16">
            <LoadingSpinner label="กำลังโหลดรายชื่อทนายความ..." />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {load === "error" && (
        <Card variant="urgent">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">😕</div>
            <h3 className="text-base font-semibold text-ink">โหลดรายชื่อไม่สำเร็จ</h3>
            <p className="text-sm text-muted">มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง</p>
            <Button variant="secondary" onClick={() => { setLoad("loading"); timer.current = setTimeout(() => setLoad("ready"), 500); }}>
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {load === "ready" && (
        <>
          {filtered.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="ไม่พบทนายที่ตรงกับตัวกรอง"
              description="ลองปรับตัวกรองหรือคำค้นหาใหม่นะคะ"
              actionLabel="ล้างตัวกรอง"
              actionHref="/lawyers"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l) => (
                <Card key={l.id} variant="hover" className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.name} size="lg" />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-ink">{l.name}</h3>
                        <p className="text-xs text-muted">{l.province} · {l.years} ปี</p>
                      </div>
                      {l.verified && <Badge variant="success" icon="✅">ยืนยันตัวตน</Badge>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="info">{l.specialtyLabel}</Badge>
                      <span className="text-xs font-medium text-ink">⭐ {l.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted">({l.reviewCount} รีวิว)</span>
                    </div>

                    <p className="text-xs leading-relaxed text-muted">{l.bio}</p>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted">ค่าปรึกษา</span>
                        <span className="font-semibold text-ink">{formatBaht(l.priceConsult)}/ชม.</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-muted">คดีทั่วไป</span>
                        <span className="font-semibold text-ink">เริ่ม {formatBaht(l.priceCase)}</span>
                      </div>
                    </div>

                    <Link href="/concierge">
                      <Button variant="outline" size="sm" className="w-full">
                        ดูโปรไฟล์และติดต่อ
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <LegalDisclaimer />
        </>
      )}
    </div>
  );
}
