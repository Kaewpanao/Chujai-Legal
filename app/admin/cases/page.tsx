"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { CASES, CASE_STATUS_LABEL } from "@/lib/practice";
import type { CaseStatus } from "@/lib/practice";
import { formatBaht, cn } from "@/lib/utils";

const FILTERS: { id: CaseStatus | "all"; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "active", label: "กำลังดำเนินการ" },
  { id: "pending_review", label: "รอตรวจสอบ" },
  { id: "filed", label: "ยื่นศาลแล้ว" },
  { id: "completed", label: "ปิดเคสแล้ว" },
];

const statusVariant = (s: CaseStatus) =>
  s === "active" || s === "filed"
    ? "info"
    : s === "completed"
      ? "success"
      : s === "pending_review"
        ? "warning"
        : "neutral";

export default function AdminCasesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CaseStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CASES.filter((c) => {
      const matchQ =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.lawyerName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchF = filter === "all" || c.status === filter;
      return matchQ && matchF;
    });
  }, [query, filter]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">เคสทั้งหมดบนแพลตฟอร์ม 📋</h2>
          <p className="text-sm text-muted">{CASES.length} เคส · {filtered.length} รายการที่แสดง</p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาเคส ลูกความ หรือทนาย..."
          className="w-full sm:max-w-xs"
          aria-label="ค้นหาเคส"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              filter === f.id
                ? "border-blue bg-blue text-white"
                : "border-line bg-white text-ink/80 hover:border-blue/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="ไม่พบเคสที่ตรงกับเงื่อนไข" description="ลองปรับคำค้นหาหรือตัวกรองสถานะใหม่" />
      ) : (
        <Card variant="base">
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-4 py-3 text-left font-semibold text-ink">รหัส</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">เคส</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">ลูกความ</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">ทนายความ</th>
                    <th className="px-4 py-3 text-right font-semibold text-ink">ค่าบริการ</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? "bg-canvas/40" : ""}>
                      <td className="px-4 py-3 font-medium text-ink">{c.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-ink/85">{c.title}</p>
                        <p className="text-xs text-muted">{c.categoryLabel}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={c.clientName} size="sm" />
                          <span className="text-ink/85">{c.clientName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{c.lawyerName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">{formatBaht(c.fee)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(c.status)}>{CASE_STATUS_LABEL[c.status]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
