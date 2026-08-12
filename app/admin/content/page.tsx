"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEGAL_CATEGORIES } from "@/lib/legal/categories";
import { DOCUMENT_CATEGORIES, DOCUMENT_TEMPLATES } from "@/lib/documents/categories";
import { FAQS } from "@/lib/admin";
import { cn } from "@/lib/utils";

type Tab = "categories" | "templates" | "faq";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "categories", label: "หมวดหมู่", icon: "📚" },
  { id: "templates", label: "เทมเพลตเอกสาร", icon: "📝" },
  { id: "faq", label: "คำถามที่พบบ่อย", icon: "💬" },
];

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">จัดการเนื้อหา 📝</h2>
          <p className="text-sm text-muted">หมวดหมู่กฎหมาย เทมเพลตเอกสาร และคำถามที่พบบ่อย</p>
        </div>
        <Button variant="primary">➕ เพิ่มเนื้อหาใหม่</Button>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="จัดการเนื้อหา" className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-blue text-white" : "bg-white text-ink/80 hover:bg-blue-50",
            )}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      {tab === "categories" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEGAL_CATEGORIES.map((cat) => (
            <Card key={cat.id} variant="hover">
              <CardContent className="flex items-center gap-3 pt-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl" aria-hidden="true">
                  {cat.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{cat.title}</p>
                  <p className="text-xs text-muted">{cat.subProblems.length} ปัญหาย่อย</p>
                </div>
                <Badge variant="neutral">{cat.number}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Templates */}
      {tab === "templates" && (
        <Card variant="base">
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-4 py-3 text-left font-semibold text-ink">เทมเพลต</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">หมวดหมู่</th>
                    <th className="px-4 py-3 text-right font-semibold text-ink">ช่องกรอก</th>
                    <th className="px-4 py-3 text-right font-semibold text-ink">เวลา</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">สิทธิ์</th>
                  </tr>
                </thead>
                <tbody>
                  {DOCUMENT_TEMPLATES.map((t, i) => (
                    <tr key={t.id} className={i % 2 ? "bg-canvas/40" : ""}>
                      <td className="px-4 py-3">
                        <p className="text-ink/85">{t.title}</p>
                        <p className="text-xs text-muted">{t.description}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {DOCUMENT_CATEGORIES.find((c) => c.id === t.categoryId)?.title ?? t.categoryId}
                      </td>
                      <td className="px-4 py-3 text-right text-ink/85">{t.fields}</td>
                      <td className="px-4 py-3 text-right text-ink/85">{t.minutes} นาที</td>
                      <td className="px-4 py-3">
                        <Badge variant={t.free ? "success" : "warning"}>{t.free ? "ฟรี" : "แพ็กเกจ"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      {tab === "faq" && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>คำถามที่พบบ่อย 💬</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <div key={f.id} className="rounded-xl border border-line p-4">
                <p className="text-sm font-semibold text-ink">❓ {f.question}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
