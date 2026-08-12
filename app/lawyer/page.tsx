import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/stat-card";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  CASES,
  CASE_STATUS_LABEL,
  PRIORITY_LABEL,
  activeCaseCount,
  countByStatus,
  totalEarnings,
  outstandingAmount,
} from "@/lib/practice";
import { formatBaht } from "@/lib/utils";

export default function LawyerDashboardPage() {
  const active = activeCaseCount();
  const pending = countByStatus(["pending_review", "draft"]);
  const completed = countByStatus("completed");
  const earnings = totalEarnings();
  const outstanding = outstandingAmount();
  const upcoming = CASES.filter((c) => c.nextDeadline);

  const statusVariant = (s: string) =>
    s === "active" || s === "filed"
      ? "info"
      : s === "completed"
        ? "success"
        : s === "pending_review"
          ? "warning"
          : "neutral";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Welcome */}
      <div>
        <h2 className="text-lg font-semibold text-ink">สวัสดีครับ ทนายสมหมาย 👋</h2>
        <p className="text-sm text-muted">
          วันนี้คุณมี {pending} เคสที่รอการตรวจสอบ และ {upcoming.length} นัดหมายที่ใกล้ถึงกำหนด
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="📋" label="เคสที่กำลังดำเนินการ" value={String(active)} delta={`ปิดแล้ว ${completed} เคส`} tone="neutral" />
        <StatCard icon="⏳" label="รอตรวจสอบ" value={String(pending)} delta="โปรดรีบดำเนินการ" tone="down" />
        <StatCard icon="💰" label="รายได้ (ชำระแล้ว)" value={formatBaht(earnings)} delta="เดือนนี้" tone="up" />
        <StatCard icon="🧾" label="ค้างชำระ" value={formatBaht(outstanding)} delta="รวมใบแจ้งหนี้ค้างชำระ" tone="down" />
      </div>

      {/* Recent cases */}
      <Card variant="base">
        <CardContent className="pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">เคสล่าสุด 📋</h3>
            <Link href="/lawyer/cases" className="text-sm font-medium text-blue hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {CASES.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/lawyer/cases/${c.id}`}
                className="flex items-center gap-3 py-3 transition-colors hover:bg-canvas/60"
              >
                <Avatar name={c.clientName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{c.title}</span>
                    {c.priority === "high" && <Badge variant="danger">เร่งด่วน</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted">
                    {c.id} · {c.clientName} · {c.categoryLabel}
                  </p>
                </div>
                <div className="hidden w-32 sm:block">
                  <Progress value={c.progress} color="blue" />
                </div>
                <Badge variant={statusVariant(c.status)}>{CASE_STATUS_LABEL[c.status]}</Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming consultations */}
        <Card variant="base">
          <CardContent className="pt-5">
            <h3 className="mb-4 text-base font-semibold text-ink">นัดหมาย / กำหนดส่งที่ใกล้ถึง 🗓️</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีกำหนดส่งที่ใกล้ถึง</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcoming.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-lg" aria-hidden="true">⏰</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{c.title}</p>
                      <p className="text-xs text-muted">{c.clientName} · {PRIORITY_LABEL[c.priority]}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-amber">{c.nextDeadline}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card variant="base">
          <CardContent className="pt-5">
            <h3 className="mb-4 text-base font-semibold text-ink">ดำเนินการด่วน ⚡</h3>
            <div className="flex flex-col gap-3">
              <Link href="/lawyer/cases">
                <Button variant="primary" className="w-full">📋 จัดการเคสทั้งหมด</Button>
              </Link>
              <Link href="/lawyer/billing">
                <Button variant="secondary" className="w-full">🧾 ออกใบแจ้งหนี้</Button>
              </Link>
              <Link href="/lawyer/profile">
                <Button variant="outline" className="w-full">👤 อัปเดตโปรไฟล์ทนาย</Button>
              </Link>
            </div>
            <LegalDisclaimer className="mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
