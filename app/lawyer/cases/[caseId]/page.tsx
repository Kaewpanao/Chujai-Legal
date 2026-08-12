import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  CASES,
  CASE_STATUS_LABEL,
  PRIORITY_LABEL,
  getCaseById,
  getClientById,
} from "@/lib/practice";
import type { TimelineEvent } from "@/lib/practice";
import { formatBaht } from "@/lib/utils";

export function generateStaticParams() {
  return CASES.map((c) => ({ caseId: c.id }));
}

// Only the known mock case IDs are valid — unknown IDs return a clean 404.
export const dynamicParams = false;

const TIMELINE_ICON: Record<TimelineEvent["type"], string> = {
  created: "📌",
  doc: "📄",
  court: "🏛️",
  payment: "💰",
  note: "📝",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseItem = getCaseById(caseId);
  if (!caseItem) notFound();

  const client = getClientById(caseItem.clientId);

  const statusVariant =
    caseItem.status === "active" || caseItem.status === "filed"
      ? "info"
      : caseItem.status === "completed"
        ? "success"
        : caseItem.status === "pending_review"
          ? "warning"
          : "neutral";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/lawyer/cases" className="text-sm font-medium text-blue hover:underline">
            ← กลับไปหน้าเคส
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-ink">{caseItem.title}</h2>
            <Badge variant={statusVariant}>{CASE_STATUS_LABEL[caseItem.status]}</Badge>
            {caseItem.priority === "high" && <Badge variant="danger">เร่งด่วน</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted">
            {caseItem.id} · {caseItem.categoryLabel} · อัปเดตล่าสุด {caseItem.lastUpdate}
          </p>
        </div>
        <Button variant="primary">✉️ ติดต่อลูกความ</Button>
      </div>

      {/* Case info */}
      <Card variant="base">
        <CardHeader>
          <CardTitle>ข้อมูลเคส</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-ink/85">{caseItem.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-canvas/70 p-3">
              <p className="text-xs text-muted">ค่าบริการ</p>
              <p className="text-sm font-semibold text-ink">{formatBaht(caseItem.fee)}</p>
            </div>
            <div className="rounded-xl bg-canvas/70 p-3">
              <p className="text-xs text-muted">ระดับความสำคัญ</p>
              <p className="text-sm font-semibold text-ink">{PRIORITY_LABEL[caseItem.priority]}</p>
            </div>
            <div className="rounded-xl bg-canvas/70 p-3">
              <p className="text-xs text-muted">กำหนดส่งถัดไป</p>
              <p className="text-sm font-semibold text-ink">{caseItem.nextDeadline ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-canvas/70 p-3">
              <p className="text-xs text-muted">ทนายผู้รับผิดชอบ</p>
              <p className="text-sm font-semibold text-ink">{caseItem.lawyerName}</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={caseItem.progress} color="blue" label="ความคืบหน้าเคส" showValue />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <Card variant="base" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ไทม์ไลน์เคส 🧭</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative flex flex-col gap-4 border-l-2 border-line pl-5">
              {caseItem.timeline.map((e, i) => (
                <li key={i} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] ring-2 ring-blue/30"
                  >
                    {TIMELINE_ICON[e.type]}
                  </span>
                  <p className="text-xs font-semibold text-muted">{e.date}</p>
                  <p className="text-sm font-medium text-ink">{e.title}</p>
                  <p className="text-sm leading-relaxed text-muted">{e.description}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Client + documents */}
        <div className="flex flex-col gap-6">
          <Card variant="base">
            <CardHeader>
              <CardTitle>ข้อมูลลูกความ 👤</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={caseItem.clientName} size="lg" />
                <div>
                  <p className="text-sm font-semibold text-ink">{caseItem.clientName}</p>
                  {client && <p className="text-xs text-muted">{client.email}</p>}
                </div>
              </div>
              {client && (
                <div className="flex flex-col gap-1.5 rounded-xl bg-canvas/70 p-3 text-sm">
                  <span className="text-ink/85">📞 {client.phone}</span>
                  <span className="text-ink/85">📍 {client.province}</span>
                  <span className="text-muted">{client.caseCount} เคสที่ใช้บริการ</span>
                </div>
              )}
              <Link href="/lawyer/clients">
                <Button variant="secondary" size="sm" className="w-full">ดูโปรไฟล์ลูกความ</Button>
              </Link>
            </CardContent>
          </Card>

          <Card variant="base">
            <CardHeader>
              <CardTitle>เอกสาร 📄</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {caseItem.documents.map((d) => (
                <div key={d.name} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-base" aria-hidden="true">📎</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                    <p className="text-xs text-muted">{d.type} · {d.size} · {d.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">ดู</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <LegalDisclaimer />
    </div>
  );
}
