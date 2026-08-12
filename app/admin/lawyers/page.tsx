"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { VERIFICATION_QUEUE } from "@/lib/admin";
import { LAWYERS } from "@/lib/lawyers";

type QueueStatus = "pending" | "approved" | "rejected";

export default function AdminLawyersPage() {
  const [queue, setQueue] = useState(
    VERIFICATION_QUEUE.map((v) => ({ ...v, status: "pending" as QueueStatus })),
  );

  const decide = (id: string, decision: "approved" | "rejected") => {
    setQueue((prev) => prev.map((v) => (v.id === id ? { ...v, status: decision } : v)));
  };

  const pendingCount = queue.filter((v) => v.status === "pending").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">การยืนยันตัวตนทนายความ ⚖️</h2>
        <p className="text-sm text-muted">
          {pendingCount} รายการรอการตรวจสอบ · {LAWYERS.length} ทนายที่ผ่านการยืนยันแล้ว
        </p>
      </div>

      {/* Verification queue */}
      <Card variant="base">
        <CardHeader>
          <CardTitle>คิวรอการตรวจสอบ 🕓</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {queue.length === 0 ? (
            <EmptyState icon="🎉" title="ไม่มีคิวรอการตรวจสอบ" description="ทนายความทั้งหมดได้รับการตรวจสอบแล้ว" />
          ) : (
            queue.map((v) => (
              <div key={v.id} className="flex flex-col gap-3 rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar name={v.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{v.name}</h3>
                      {v.status === "approved" && <Badge variant="success">อนุมัติแล้ว</Badge>}
                      {v.status === "rejected" && <Badge variant="danger">ปฏิเสธแล้ว</Badge>}
                      {v.status === "pending" && <Badge variant="warning">รอตรวจสอบ</Badge>}
                    </div>
                    <p className="text-xs text-muted">
                      ใบอนุญาต {v.licenseNo} · {v.specialty} · {v.province} · ส่งเมื่อ {v.submitted}
                    </p>
                  </div>
                  {v.status === "pending" && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => decide(v.id, "approved")}>
                        ✅ อนุมัติ
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => decide(v.id, "rejected")}>
                        ✕ ปฏิเสธ
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {v.documents.map((d) => (
                    <span key={d} className="rounded-lg bg-canvas/70 px-2.5 py-1 text-xs text-ink/80">
                      📎 {d}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Verified lawyers */}
      <Card variant="base">
        <CardHeader>
          <CardTitle>ทนายความที่ผ่านการยืนยัน ✅</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60">
                  <th className="px-4 py-3 text-left font-semibold text-ink">ทนายความ</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">เชี่ยวชาญ</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">จังหวัด</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink">รีวิว</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {LAWYERS.map((l, i) => (
                  <tr key={l.id} className={i % 2 ? "bg-canvas/40" : ""}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={l.name} size="sm" />
                        <span className="font-medium text-ink">{l.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/85">{l.specialtyLabel}</td>
                    <td className="px-4 py-3 text-muted">{l.province}</td>
                    <td className="px-4 py-3 text-right text-ink/85">⭐ {l.rating.toFixed(1)} ({l.reviewCount})</td>
                    <td className="px-4 py-3">
                      <Badge variant={l.verified ? "success" : "warning"}>
                        {l.verified ? "ยืนยันแล้ว" : "รอตรวจสอบ"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
