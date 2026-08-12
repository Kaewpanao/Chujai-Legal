"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  LEGAL_CATEGORIES,
  getCategoryById,
} from "@/lib/legal/categories";
import { sourceForCategory } from "@/lib/legal/sources";
import { DOCUMENT_CATEGORIES } from "@/lib/documents/categories";
import { cn } from "@/lib/utils";

const PHASES = [
  "เข้าใจปัญหา",
  "วิเคราะห์สิทธิ",
  "เลือกเส้นทาง",
  "เขตอำนาจ",
  "เอกสาร",
  "เตรียมตัว",
  "ยื่นเรื่อง",
  "ติดตามผล",
];

const PROVINCES = [
  "กรุงเทพมหานคร",
  "นนทบุรี",
  "สมุทรปราการ",
  "ปทุมธานี",
  "ชลบุรี",
  "เชียงใหม่",
  "ขอนแก่น",
  "อื่น ๆ",
];

export default function ConciergePage() {
  const [phase, setPhase] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [pathChoice, setPathChoice] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  // Simulated current package (real app reads from auth/profile).
  const [pack] = useState<"free" | "paid">("free");

  const category = categoryId ? getCategoryById(categoryId) : null;
  const source = category ? sourceForCategory(category.id) : null;

  const goNext = () => setPhase((p) => Math.min(PHASES.length - 1, p + 1));
  const goBack = () => setPhase((p) => Math.max(0, p - 1));

  const pct = Math.round(((phase + 1) / PHASES.length) * 100);

  // Monetization gate: phases 4–8 require a paid package.
  const gated = phase >= 3 && pack === "free" && !unlocked;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {/* Phase container / progress */}
      <Card variant="base">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">
              ขั้นตอนที่ {phase + 1} / {PHASES.length}
            </span>
            <Badge variant="info" icon="🧭">Concierge · {PHASES[phase]}</Badge>
          </div>
          <Progress value={pct} label="ความคืบหน้า" showValue />
        </CardContent>
      </Card>

      {/* PHASE 1 — understand */}
      {phase === 0 && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เล่าเรื่องของคุณให้เราฟัง 💬</CardTitle>
            <p className="text-sm text-muted">
              Concierge จะพาคุณไปทีละขั้นจนจบ — เริ่มจากเลือกหมวดและเล่าเหตุการณ์
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LEGAL_CATEGORIES.map((cat) => {
                const active = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all",
                      active ? "border-blue bg-blue-50/60 shadow-sm" : "border-line bg-white hover:border-blue/40",
                    )}
                  >
                    <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
                    <span className="text-sm font-medium text-ink">{cat.title}</span>
                  </button>
                );
              })}
            </div>
            <div>
              <label htmlFor="conc-narrative" className="mb-2 block text-sm font-semibold text-ink">
                เล่าเหตุการณ์โดยย่อ
              </label>
              <textarea
                id="conc-narrative"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={4}
                placeholder="เล่าเหตุการณ์ วันที่ และสิ่งที่เกิดขึ้น..."
                className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>
          </CardContent>
          <div className="flex justify-end p-5 pt-0">
            <Button onClick={goNext} disabled={!categoryId}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 2 — rights */}
      {phase === 1 && category && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>สิทธิของคุณ {category.icon}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-ink/90">
              สำหรับหมวด “{category.title}” คุณได้รับการคุ้มครองตามกฎหมาย —
              ต่อไปนี้คือสิทธิเบื้องต้นที่เกี่ยวข้อง
            </p>
            {source && source.sections.length > 0 && (
              <ul className="flex flex-col gap-2">
                {source.sections.slice(0, 2).map((s, i) => (
                  <li key={i} className="rounded-lg bg-blue-50/60 px-3 py-2 text-xs text-ink/80">
                    <span className="font-medium text-blue-dark">{source.shortName} {s.ref}</span>
                    {" — "}{s.label}
                  </li>
                ))}
              </ul>
            )}
            <LegalDisclaimer />
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 3 — choose path (monetization gate follows) */}
      {phase === 2 && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เลือกเส้นทางดำเนินการ 🧭</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { id: "self", icon: "🧑‍💻", title: "ทำเอง", desc: "ใช้เอกสารและขั้นตอนจากชูใจ ดำเนินการด้วยตัวเอง" },
              { id: "lawyer", icon: "⚖️", title: "ปรึกษาทนาย", desc: "ให้ทนายผู้เชี่ยวชาญช่วยดูแลเคสของคุณ" },
              { id: "mediation", icon: "🤝", title: "ไกล่เกลี่ย", desc: "เจรจาตกลงกันโดยไม่ต้องขึ้นศาล" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPathChoice(opt.id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                  pathChoice === opt.id ? "border-blue bg-blue-50/60 shadow-sm" : "border-line bg-white hover:border-blue/40",
                )}
              >
                <span className="text-2xl" aria-hidden="true">{opt.icon}</span>
                <span>
                  <span className="block font-semibold text-ink">{opt.title}</span>
                  <span className="block text-sm text-muted">{opt.desc}</span>
                </span>
              </button>
            ))}
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext} disabled={!pathChoice}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* MONETIZATION GATE — phases 4–8 locked on free plan */}
      {gated && (
        <Card variant="base" className="border-2 border-blue/30">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-3xl">🔒</div>
            <h3 className="text-lg font-semibold text-ink">
              ขั้นตอนที่ 4–8 เป็นสิทธิ์ของแพ็กเกจ Action Pack ขึ้นไป
            </h3>
            <p className="max-w-md text-sm text-muted">
              เขตอำนาจศาล รายการเอกสาร การเตรียมตัว การยื่น และติดตามผล
              จะถูกปลดล็อกเพื่อพาคุณไปจนจบเคสอย่างมั่นใจ
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/pricing">
                <Button variant="upgrade">💎 ดูแพ็กเกจ (เริ่ม ฿299)</Button>
              </Link>
              <Button variant="secondary" onClick={() => setUnlocked(true)}>
                ฉันมีแพ็กเกจแล้ว → ปลดล็อก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PHASE 4 — jurisdiction (only when unlocked) */}
      {phase === 3 && !gated && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เขตอำนาจศาล / สถานีตำรวจ 📍</CardTitle>
            <p className="text-sm text-muted">
              เลือกจังหวัดที่เกิดเหตุหรือที่คุณสะดวกไปยื่นเรื่อง
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PROVINCES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvince(p)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  province === p ? "border-blue bg-blue text-white" : "border-line bg-white text-ink/80 hover:border-blue/40",
                )}
              >
                {p}
              </button>
            ))}
            {province && (
              <p className="mt-2 w-full rounded-lg bg-green/10 px-3 py-2 text-xs text-green">
                ✅ เราแนะนำให้ติดต่อหน่วยงานในพื้นที่ {province} — ข้อมูลติดต่อจะแสดงในขั้นตอนยื่นเรื่อง
              </p>
            )}
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext} disabled={!province}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 5 — documents */}
      {phase === 4 && !gated && category && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>รายการเอกสารที่ต้องเตรียม 📄</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted">
              จากหมวด “{category.title}” และเส้นทาง “{pathChoice === "lawyer" ? "ปรึกษาทนาย" : pathChoice === "mediation" ? "ไกล่เกลี่ย" : "ทำเอง"}”
              คุณจะต้องใช้เอกสารเหล่านี้ (สร้างได้จากไลบรารีเอกสาร):
            </p>
            <ul className="flex flex-col gap-2">
              {DOCUMENT_CATEGORIES.slice(0, 4).map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm text-ink/85">
                  <span aria-hidden="true">{doc.icon}</span>
                  <span className="flex-1">{doc.title}</span>
                  <Link href="/documents" className="text-xs font-medium text-blue hover:underline">
                    สร้าง →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 6 — prepare */}
      {phase === 5 && !gated && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เตรียมตัวก่อนยื่น 📝</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ol className="flex flex-col gap-2">
              {[
                "ตรวจสอบเอกสารครบถ้วนและลงนามให้เรียบร้อย",
                "ถ่ายสำเนาเอกสารและบัตรประชาชน 1 ชุด",
                "จดลำดับเหตุการณ์และวันเวลาที่สำคัญไว้ให้ครบ",
                "เตรียมคำถามที่อยากถามเจ้าหน้าที่หรือทนาย",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-semibold text-white">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 7 — file */}
      {phase === 6 && !gated && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>ยื่นเรื่อง 🚀</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-ink/90">
              คุณพร้อมยื่นเรื่องแล้ว — อย่าลืมว่าการยื่นเอกสารต้องทำโดยตัวคุณเองหรือทนายของคุณ
              ชูใจช่วยเตรียมได้ แต่ไม่ยื่นแทน
            </p>
            <p className="rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber">
              ⚠️ ข้อควรระวัง: การแจ้งข้อมูลอันเป็นเท็จต่อเจ้าหน้าที่มีความผิดตาม
              ประมวลกฎหมายอาญา มาตรา 177 — กรุณาให้ข้อมูลตามความเป็นจริงเสมอ
            </p>
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 8 — follow-up / success */}
      {phase === 7 && !gated && category && (
        <Card variant="base">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green/10 text-3xl">🎉</div>
            <h3 className="text-lg font-semibold text-ink">Concierge พาคุณมาถึงจุดนี้แล้ว!</h3>
            <p className="max-w-md text-sm text-muted">
              เคส “{category.title}” ของคุณถูกบันทึกไว้ในระบบแล้ว เราจะแจ้งเตือนวันสำคัญ
              และติดตามความคืบหน้าให้คุณอย่างต่อเนื่อง
            </p>
            <ul className="flex w-full max-w-sm flex-col gap-2 text-left">
              {["วันนัดหมาย/ยื่นเรื่อง", "ติดตามสถานะทุก 7 วัน", "แจ้งเตือนทาง LINE (แพ็กเกจ Case Plus)"].map((t, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm text-ink/85">
                  <span aria-hidden="true">🔔</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/notifications">
                <Button variant="primary">🔔 ดูการแจ้งเตือน</Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => { setPhase(0); setCategoryId(null); setNarrative(""); setPathChoice(null); setProvince(null); setUnlocked(false); }}
              >
                เริ่มเคสใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
