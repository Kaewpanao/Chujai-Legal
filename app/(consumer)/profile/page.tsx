"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { getTier, PACKAGE_TIERS } from "@/lib/packages/definitions";
import { cn } from "@/lib/utils";

type Tab = "info" | "package" | "settings";
type LoadState = "loading" | "ready" | "error";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "info", label: "ข้อมูลส่วนตัว", icon: "👤" },
  { id: "package", label: "แพ็กเกจของฉัน", icon: "💎" },
  { id: "settings", label: "ตั้งค่า", icon: "⚙️" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("info");
  const [load, setLoad] = useState<LoadState>("loading");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    phone: "081-234-5678",
    province: "กรุงเทพมหานคร",
  });
  // Simulated current package (real app reads from auth/profile).
  const [currentTier] = useState<"free" | "action" | "case_plus" | "sme">("free");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setLoad("ready"), 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const tier = getTier(currentTier);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    timer.current = setTimeout(() => setSaved(false), 2500);
  };

  const field = (id: string, label: string, value: string, onChange: (v: string) => void, type = "text") => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      {/* Header / avatar */}
      <Card variant="base">
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-center">
          <Avatar name={form.name} size="lg" className="h-16 w-16 text-xl" />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-ink">{form.name}</h2>
            <p className="text-sm text-muted">{form.email}</p>
            <div className="mt-1">
              <Badge variant={currentTier === "free" ? "neutral" : "success"} icon={tier.emoji}>
                แพ็กเกจ: {tier.name}
              </Badge>
            </div>
          </div>
          <Link href="/pricing" className="sm:ml-auto">
            <Button variant="upgrade" size="sm">💎 อัปเกรดแพ็กเกจ</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div role="tablist" aria-label="ตั้งค่าโปรไฟล์" className="flex gap-2">
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

      {/* Loading */}
      {load === "loading" && (
        <Card variant="base">
          <CardContent className="flex items-center justify-center py-16">
            <LoadingSpinner label="กำลังโหลดโปรไฟล์ของคุณ..." />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {load === "error" && (
        <Card variant="urgent">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">😕</div>
            <h3 className="text-base font-semibold text-ink">โหลดโปรไฟล์ไม่สำเร็จ</h3>
            <Button variant="secondary" onClick={() => { setLoad("loading"); timer.current = setTimeout(() => setLoad("ready"), 500); }}>
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      )}

      {load === "ready" && (
        <>
          {/* INFO TAB */}
          {tab === "info" && (
            <Card variant="base">
              <CardHeader>
                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
                  {field("p-name", "ชื่อ-นามสกุล", form.name, (v) => setForm({ ...form, name: v }))}
                  {field("p-email", "อีเมล", form.email, (v) => setForm({ ...form, email: v }), "email")}
                  {field("p-phone", "เบอร์โทรศัพท์", form.phone, (v) => setForm({ ...form, phone: v }))}
                  {field("p-province", "จังหวัด", form.province, (v) => setForm({ ...form, province: v }))}
                  <div className="sm:col-span-2">
                    {saved && (
                      <p className="mb-2 rounded-xl bg-green/10 px-3 py-2 text-sm text-green" role="status">
                        ✅ บันทึกข้อมูลเรียบร้อยแล้ว
                      </p>
                    )}
                    <Button type="submit">บันทึกข้อมูล</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* PACKAGE TAB */}
          {tab === "package" && (
            <Card variant="base">
              <CardHeader>
                <CardTitle>แพ็กเกจของคุณ: {tier.name} {tier.emoji}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted">{tier.tagline}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-ink/85">
                      <span aria-hidden="true">{f.included ? "✅" : "🚫"}</span>
                      <span className={f.included ? "" : "text-muted/60"}>{f.label}</span>
                      {f.note && <span className="text-xs text-muted">({f.note})</span>}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="self-start">
                  <Button variant="upgrade">เปรียบเทียบและอัปเกรด</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <Card variant="base">
              <CardHeader>
                <CardTitle>ตั้งค่า</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { id: "notif-case", label: "แจ้งเตือนความคืบหน้าเคส", default: true },
                  { id: "notif-line", label: "แจ้งเตือนทาง LINE", default: false, locked: true },
                  { id: "notif-email", label: "อีเมลสรุปประจำสัปดาห์", default: true },
                  { id: "privacy", label: "ไม่เปิดเผยข้อมูลให้บุคคลภายนอก (PDPA)", default: true },
                ].map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3">
                    <input type="checkbox" defaultChecked={s.default} className="h-4 w-4 accent-blue" />
                    <span className="flex-1 text-sm text-ink">{s.label}</span>
                    {s.locked && <Badge variant="neutral">Case Plus</Badge>}
                  </label>
                ))}
                <LegalDisclaimer className="mt-2" />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
