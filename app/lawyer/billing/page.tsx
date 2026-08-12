import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { INVOICES, totalEarnings, outstandingAmount } from "@/lib/practice";
import type { InvoiceStatus } from "@/lib/practice";
import { formatBaht } from "@/lib/utils";

const statusMeta: Record<InvoiceStatus, { label: string; variant: "success" | "warning" | "danger" }> = {
  paid: { label: "ชำระแล้ว", variant: "success" },
  pending: { label: "รอชำระ", variant: "warning" },
  overdue: { label: "เกินกำหนด", variant: "danger" },
};

export default function LawyerBillingPage() {
  const paidCount = INVOICES.filter((i) => i.status === "paid").length;
  const pendingCount = INVOICES.filter((i) => i.status === "pending").length;
  const overdueCount = INVOICES.filter((i) => i.status === "overdue").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">การเงินและใบแจ้งหนี้ 💰</h2>
          <p className="text-sm text-muted">สรุปรายได้และใบแจ้งหนี้ทั้งหมดของคุณ</p>
        </div>
        <Button variant="primary">➕ ออกใบแจ้งหนี้ใหม่</Button>
      </div>

      {/* Earnings summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="💰" label="รายได้รวม (ชำระแล้ว)" value={formatBaht(totalEarnings())} tone="up" />
        <StatCard icon="⏳" label="รอชำระ" value={formatBaht(INVOICES.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0))} tone="neutral" />
        <StatCard icon="⚠️" label="เกินกำหนด" value={formatBaht(INVOICES.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0))} tone="down" />
        <StatCard icon="🧾" label="ค้างชำระรวม" value={formatBaht(outstandingAmount())} delta={`${paidCount} ชำระแล้ว · ${pendingCount + overdueCount} ค้าง`} tone="neutral" />
      </div>

      {/* Invoices table */}
      <Card variant="base">
        <CardContent className="pt-5">
          <h3 className="mb-4 text-base font-semibold text-ink">ใบแจ้งหนี้ทั้งหมด 🧾</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/60">
                  <th className="px-4 py-3 text-left font-semibold text-ink">เลขที่</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">ลูกความ</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">เคส</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink">จำนวนเงิน</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">สถานะ</th>
                  <th className="px-4 py-3 text-left font-semibold text-ink">ครบกำหนด</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv, i) => (
                  <tr key={inv.id} className={i % 2 ? "bg-canvas/40" : ""}>
                    <td className="px-4 py-3 font-medium text-ink">{inv.id}</td>
                    <td className="px-4 py-3 text-ink/85">{inv.clientName}</td>
                    <td className="px-4 py-3 text-muted">{inv.caseTitle}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{formatBaht(inv.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMeta[inv.status].variant}>{statusMeta[inv.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{inv.due}</td>
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
