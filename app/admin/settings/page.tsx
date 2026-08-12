"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_SETTINGS } from "@/lib/admin";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [commission, setCommission] = useState("15");
  const [settings, setSettings] = useState(PLATFORM_SETTINGS.map((s) => ({ ...s })));

  const toggle = (id: string) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">ตั้งค่าแพลตฟอร์ม ⚙️</h2>
        <p className="text-sm text-muted">การกำหนดค่าระบบและค่าคอมมิชชันของแพลตฟอร์ม</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Commission */}
        <Card variant="base">
          <CardHeader>
            <CardTitle>ค่าคอมมิชชันแพลตฟอร์ม 🏦</CardTitle>
          </CardHeader>
          <CardContent>
            <label htmlFor="commission" className="mb-1.5 block text-sm font-semibold text-ink">
              อัตราค่าคอมมิชชัน (%)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="commission"
                type="number"
                min={0}
                max={100}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="max-w-[160px]"
              />
              <span className="text-sm font-semibold text-ink">%</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              เปอร์เซ็นต์ที่หักจากค่าบริการทนายความ (ค่าเริ่มต้น 15%)
            </p>
          </CardContent>
        </Card>

        {/* Feature flags */}
        <Card variant="base">
          <CardHeader>
            <CardTitle>การตั้งค่าฟีเจอร์ 🔧</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {settings.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{s.label}</p>
                  <p className="text-xs text-muted">{s.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.enabled}
                  onClick={() => toggle(s.id)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    s.enabled ? "bg-blue" : "bg-line",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      s.enabled ? "left-[22px]" : "left-0.5",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Danger zone / meta */}
        <Card variant="base">
          <CardHeader>
            <CardTitle>ข้อมูลระบบ 🛠️</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl bg-canvas/70 p-3 text-sm">
              <span className="text-muted">เวอร์ชันแพลตฟอร์ม</span>
              <Badge variant="info">v0.1.0 (Mock)</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-canvas/70 p-3 text-sm">
              <span className="text-muted">สถานะการเชื่อมต่อ Supabase</span>
              <Badge variant="warning">ยังไม่เชื่อมต่อ</Badge>
            </div>
            <p className="text-xs text-muted">
              💡 ข้อมูลทั้งหมดในเฟสนี้เป็นข้อมูลจำลอง (Mock) — จะเชื่อมต่อกับฐานข้อมูลจริงในเฟสถัดไป
            </p>
          </CardContent>
        </Card>

        {saved && (
          <p className="rounded-xl bg-green/10 px-3 py-2 text-sm text-green" role="status">
            ✅ บันทึกการตั้งค่าเรียบร้อยแล้ว
          </p>
        )}
        <Button type="submit" className="self-start">บันทึกการตั้งค่า</Button>
      </form>
    </div>
  );
}
