"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { CLIENTS } from "@/lib/practice";
import { formatBaht } from "@/lib/utils";

export default function LawyerClientsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLIENTS.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">ลูกความของคุณ 👥</h2>
          <p className="text-sm text-muted">
            {CLIENTS.length} ลูกความ · {CLIENTS.filter((c) => c.status === "active").length} กำลังใช้บริการ
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อ อีเมล หรือจังหวัด..."
          className="w-full sm:max-w-xs"
          aria-label="ค้นหาลูกความ"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="ไม่พบลูกความที่ตรงกับคำค้นหา"
          description="ลองพิมพ์ชื่อหรือจังหวัดอื่นดูนะครับ"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} variant="hover" className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 pt-5">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-ink">{c.name}</h3>
                    <p className="truncate text-xs text-muted">{c.email}</p>
                  </div>
                  <Badge variant={c.status === "active" ? "success" : "neutral"} className="ml-auto">
                    {c.status === "active" ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1.5 rounded-xl bg-canvas/70 p-3 text-sm">
                  <span className="text-ink/85">📞 {c.phone}</span>
                  <span className="text-ink/85">📍 {c.province}</span>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted">จำนวนเคส</span>
                    <span className="font-semibold text-ink">{c.caseCount} เคส</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-muted">ใช้จ่ายรวม</span>
                    <span className="font-semibold text-ink">{formatBaht(c.totalSpent)}</span>
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
