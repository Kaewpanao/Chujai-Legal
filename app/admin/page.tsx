import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import {
  USERS,
  TRANSACTIONS,
  VERIFICATION_QUEUE,
  countUsersByRole,
  totalRevenue,
} from "@/lib/admin";
import { LEGAL_CATEGORIES } from "@/lib/legal/categories";
import { formatBaht, formatNumber } from "@/lib/utils";

// Simple monthly revenue series for the placeholder chart.
const MONTHLY_REVENUE = [
  { month: "มี.ค.", value: 42 },
  { month: "เม.ย.", value: 55 },
  { month: "พ.ค.", value: 48 },
  { month: "มิ.ย.", value: 71 },
  { month: "ก.ค.", value: 66 },
  { month: "ส.ค.", value: 89 },
];

export default function AdminOverviewPage() {
  const totalUsers = USERS.length;
  const totalLawyers = countUsersByRole("lawyer");
  const totalCases = USERS.reduce((sum, u) => sum + u.caseCount, 0);
  const revenue = totalRevenue();
  const maxRevenue = Math.max(...MONTHLY_REVENUE.map((m) => m.value));
  const pendingVerification = VERIFICATION_QUEUE.length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">ภาพรวมแพลตฟอร์ม 📊</h2>
          <p className="text-sm text-muted">ตัวชี้วัดและสถานะระบบ ณ วันนี้</p>
        </div>
        <Button variant="secondary">📥 ดาวน์โหลดรายงาน</Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="👥" label="ผู้ใช้งานทั้งหมด" value={formatNumber(totalUsers)} delta="+3 รายเดือนนี้" tone="up" />
        <StatCard icon="📋" label="เคสทั้งหมด" value={formatNumber(totalCases)} delta="+12 รายเดือนนี้" tone="up" />
        <StatCard icon="⚖️" label="ทนายความ" value={formatNumber(totalLawyers)} delta={`${pendingVerification} รอการยืนยัน`} tone="neutral" />
        <StatCard icon="💰" label="รายได้รวม" value={formatBaht(revenue)} delta="จากการชำระสำเร็จ" tone="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart placeholder */}
        <Card variant="base" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>รายได้รายเดือน 📈</CardTitle>
            <Badge variant="neutral">กราฟตัวอย่าง</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-3">
              {MONTHLY_REVENUE.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs text-muted">{m.value}%</span>
                  <div
                    className="w-full rounded-t-lg gradient-blue"
                    style={{ height: `${(m.value / maxRevenue) * 100}%` }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-ink">{m.month}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              💡 กราฟนี้เป็นข้อมูลตัวอย่าง — จะเชื่อมต่อกับข้อมูลจริง (Supabase) ในเฟสถัดไป
            </p>
          </CardContent>
        </Card>

        {/* Cases by category */}
        <Card variant="base">
          <CardHeader>
            <CardTitle>เคสตามหมวดกฎหมาย 🧭</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {LEGAL_CATEGORIES.slice(0, 6).map((cat, i) => {
              const pct = 100 - i * 13;
              return (
                <div key={cat.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-ink/85">{cat.icon} {cat.title}</span>
                    <span className="font-semibold text-ink">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full gradient-blue" style={{ width: `${pct}%` }} aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card variant="base">
        <CardContent className="pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">ธุรกรรมล่าสุด 💳</h3>
            <Link href="/admin/revenue" className="text-sm font-medium text-blue hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {TRANSACTIONS.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-base" aria-hidden="true">💳</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{t.user} · {t.type}</p>
                  <p className="text-xs text-muted">{t.id} · {t.date} · {t.method}</p>
                </div>
                <span className="text-sm font-semibold text-ink">{formatBaht(t.amount)}</span>
                <Badge variant={t.status === "success" ? "success" : t.status === "pending" ? "warning" : "danger"}>
                  {t.status === "success" ? "สำเร็จ" : t.status === "pending" ? "รอดำเนินการ" : "คืนเงิน"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
