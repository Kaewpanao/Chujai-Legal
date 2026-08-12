"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LEGAL_CATEGORIES } from "@/lib/legal/categories";
import { cn } from "@/lib/utils";

export default function LawyerProfilePage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "ทนายสมหมาย รักธรรม",
    licenseNo: "ท.14567/2558",
    email: "sommai@chujai.legal",
    phone: "086-999-0000",
    province: "กรุงเทพมหานคร",
    bio: "ทนายความผู้เชี่ยวชาญด้านภัยออนไลน์และแรงงาน มากกว่า 10 ปี ช่วยเหลือลูกความด้วยความใส่ใจและละมุน",
  });
  const [specialties, setSpecialties] = useState<string[]>(["online_fraud", "labour", "consumer"]);

  const toggleSpecialty = (id: string) => {
    setSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      {/* Header */}
      <Card variant="base">
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-center">
          <Avatar name={form.name} size="lg" className="h-16 w-16 text-xl" />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-ink">{form.name}</h2>
            <p className="text-sm text-muted">ใบอนุญาต {form.licenseNo}</p>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              <Badge variant="success" icon="✅">ผ่านการยืนยันตัวตน</Badge>
              <Badge variant="info" icon="⭐">4.9 คะแนน</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification status */}
      <Card variant="base">
        <CardHeader>
          <CardTitle>สถานะการยืนยันตัวตน 🛡️</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-green/10 p-3">
            <span className="text-2xl" aria-hidden="true">✅</span>
            <div>
              <p className="text-sm font-semibold text-green">ยืนยันตัวตนสำเร็จแล้ว</p>
              <p className="text-xs text-muted">ใบอนุญาตและเอกสารของคุณได้รับการตรวจสอบจากทีมชูใจเรียบร้อย</p>
            </div>
          </div>
          <p className="text-xs text-muted">
            📅 ยืนยันเมื่อ 12 ม.ค. 2568 · ทนายที่ผ่านการยืนยันจะได้รับเครื่องหมาย ✅ และเข้าถึงเคสได้เต็มรูปแบบ
          </p>
        </CardContent>
      </Card>

      {/* Bio form */}
      <Card variant="base">
        <CardHeader>
          <CardTitle>ข้อมูลโปรไฟล์ 👤</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="l-name" className="mb-1.5 block text-sm font-semibold text-ink">ชื่อ-นามสกุล</label>
              <Input id="l-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="l-license" className="mb-1.5 block text-sm font-semibold text-ink">เลขที่ใบอนุญาต</label>
              <Input id="l-license" value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
            </div>
            <div>
              <label htmlFor="l-email" className="mb-1.5 block text-sm font-semibold text-ink">อีเมล</label>
              <Input id="l-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label htmlFor="l-phone" className="mb-1.5 block text-sm font-semibold text-ink">เบอร์โทรศัพท์</label>
              <Input id="l-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="l-province" className="mb-1.5 block text-sm font-semibold text-ink">จังหวัด</label>
              <Input id="l-province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="l-bio" className="mb-1.5 block text-sm font-semibold text-ink">แนะนำตัว (Bio)</label>
              <textarea
                id="l-bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>
            {saved && (
              <p className="sm:col-span-2 rounded-xl bg-green/10 px-3 py-2 text-sm text-green" role="status">
                ✅ บันทึกข้อมูลเรียบร้อยแล้ว
              </p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit">บันทึกข้อมูล</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card variant="base">
        <CardHeader>
          <CardTitle>ความเชี่ยวชาญ 🎯</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted">เลือกหมวดกฎหมายที่คุณเชี่ยวชาญ (แตะเพื่อเลือก/ยกเลิก)</p>
          <div className="flex flex-wrap gap-2">
            {LEGAL_CATEGORIES.map((cat) => {
              const selected = specialties.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleSpecialty(cat.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-blue bg-blue text-white"
                      : "border-line bg-white text-ink/80 hover:border-blue/40",
                  )}
                >
                  {cat.icon} {cat.title}
                </button>
              );
            })}
          </div>
          <LegalDisclaimer className="mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}
