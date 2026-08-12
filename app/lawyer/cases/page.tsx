"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { CASES, CASE_STATUS_LABEL, PRIORITY_LABEL } from "@/lib/practice";
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

export default function LawyerCasesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CaseStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CASES.filter((c) => {
      const matchQ =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchF = filter === "all" || c.status === filter;
      return matchQ && matchF;
    });
  }, [query, filter]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">จัดการเคส 📋</h2>
          <p className="text-sm text-muted">
            {CASES.length} เคส · {filtered.length} รายการที่แสดง
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อเคส ลูกความ หรือรหัสเคส..."
          className="w-full sm:max-w-xs"
          aria-label="ค้นหาเคส"
        />
      </div>

      {/* Status filter */}
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
        <EmptyState
          icon="🔍"
          title="ไม่พบเคสที่ตรงกับเงื่อนไข"
          description="ลองปรับคำค้นหาหรือตัวกรองสถานะใหม่นะครับ"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <Card key={c.id} variant="hover" className="w-full">
              <CardContent className="pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Avatar name={c.clientName} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{c.title}</h3>
                      <Badge variant={statusVariant(c.status)}>{CASE_STATUS_LABEL[c.status]}</Badge>
                      {c.priority === "high" && <Badge variant="danger">เร่งด่วน</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {c.id} · {c.clientName} · {c.categoryLabel} · อัปเดต {c.lastUpdate}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span>ค่าบริการ <span className="font-semibold text-ink">{formatBaht(c.fee)}</span></span>
                      {c.nextDeadline && (
                        <span className="font-semibold text-amber">⏰ {c.nextDeadline}</span>
                      )}
                      <span>{PRIORITY_LABEL[c.priority]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <div className="w-full sm:w-32">
                      <Progress value={c.progress} color="blue" showValue />
                    </div>
                    <Link href={`/lawyer/cases/${c.id}`}>
                      <Button variant="outline" size="sm">ดูรายละเอียด</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
