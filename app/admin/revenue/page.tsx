import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { TRANSACTIONS, totalRevenue, totalRefunded } from "@/lib/admin";
import type { TransactionStatus } from "@/lib/admin";
import { formatBaht } from "@/lib/utils";

const statusMeta: Record<TransactionStatus, { label: string; variant: "success" | "warning" | "danger" }> = {
  success: { label: "สำเร็จ", variant: "success" },
  pending: { label: "รอดำเนินการ", variant: "warning" },
  refunded: { label: "คืนเงิน", variant: "danger" },
};

export default function AdminRevenuePage() {
  const successCount = TRANSACTIONS.filter((t) => t.status === "success").length;
  const pendingAmount = TRANSACTIONS.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const commission = Math.round(totalRevenue() * 0.15);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">แดชบอร์ดรายได้ 💰</h2>
          <p className="text-sm text-muted">ภาพรวมรายได้และธุรกรรมของแพลตฟอร์ม</p>
        </div>
        <Link href="/admin/revenue" className="text-sm font-medium text-blue hover:underline">
          📥 ส่งออกรายงาน →
        </Link>
      </div>

      {/* Revenue stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="💰" label="รายได้รวม (สุทธิ)" value={formatBaht(totalRevenue())} delta={`${successCount} รายการสำเร็จ`} tone="up" />
        <StatCard icon="🏦" label="ค่าคอมมิชชัน (15%)" value={formatBaht(commission)} tone="neutral" />
        <StatCard icon="⏳" label="รอดำเนินการ" value={formatBaht(pendingAmount)} tone="neutral" />
        <StatCard icon="↩️" label="คืนเงิน" value={formatBaht(totalRefunded())} tone="down" />
      </div>

      {/* Transactions table */}
      <Card variant="base">
        <CardContent className="pt-5">
          <h3 className="mb-4 text-base font-semibold text-ink">ธุรกรรมทั้งหมด 💳</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60">
                  <th className="px-4 py-3 text-left font-semibold text-ink">รหัส</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">ผู้ใช้</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">ประเภท</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink">จำนวนเงิน</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">สถานะ</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">ช่องทาง</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((t, i) => (
                  <tr key={t.id} className={i % 2 ? "bg-canvas/40" : ""}>
                    <td className="px-4 py-3 font-medium text-ink">{t.id}</td>
                    <td className="px-4 py-3 text-ink/85">{t.user}</td>
                    <td className="px-4 py-3 text-muted">{t.type}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{formatBaht(t.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMeta[t.status].variant}>{statusMeta[t.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.method}</td>
                    <td className="px-4 py-3 text-muted">{t.date}</td>
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
