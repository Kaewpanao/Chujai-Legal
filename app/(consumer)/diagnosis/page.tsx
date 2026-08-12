"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  LEGAL_CATEGORIES,
  getCategoryById,
} from "@/lib/legal/categories";
import { FEAR_LEVELS, getFearLevel } from "@/lib/legal/fear-calibration";
import { sourceForCategory } from "@/lib/legal/sources";
import { cn } from "@/lib/utils";
import type { FearLevelId } from "@/lib/legal/fear-calibration";

const PHASES = [
  "ปรับอารมณ์",
  "เลือกหมวดหมู่",
  "ตอบคำถาม",
  "วิเคราะห์ AI",
  "รู้สิทธิ",
  "เลือกเส้นทาง",
  "ขั้นตอนถัดไป",
  "สรุปผล",
];

type AnalysisState = "idle" | "loading" | "success" | "error";

export default function DiagnosisPage() {
  const [phase, setPhase] = useState(0);
  const [fearId, setFearId] = useState<FearLevelId | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subProblem, setSubProblem] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisState>("idle");
  const [pathChoice, setPathChoice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prefill category from ?category=<id> (linked from the home grid).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat && getCategoryById(cat)) {
      setCategoryId(cat);
      setPhase(1); // skip fear calibration when arriving via a category link
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const fear = fearId ? getFearLevel(fearId) : null;
  const category = categoryId ? getCategoryById(categoryId) : null;
  const source = category ? sourceForCategory(category.id) : null;

  const goNext = () => setPhase((p) => Math.min(PHASES.length - 1, p + 1));
  const goBack = () => setPhase((p) => Math.max(0, p - 1));

  const startAnalysis = () => {
    if (timer.current) clearTimeout(timer.current);
    setAnalysis("loading");
    timer.current = setTimeout(() => {
      if (narrative.trim().length < 5) {
        setAnalysis("error");
      } else {
        setAnalysis("success");
      }
    }, 1300);
  };

  const pct = Math.round(((phase + 1) / PHASES.length) * 100);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {/* Phase indicator */}
      <Card variant="base">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">
              ขั้นตอนที่ {phase + 1} / {PHASES.length}
            </span>
            <Badge variant="info">{PHASES[phase]}</Badge>
          </div>
          <Progress value={pct} label="ความคืบหน้าการวินิจฉัย" showValue />
          <ol className="flex flex-wrap gap-1.5" aria-label="รายการขั้นตอน">
            {PHASES.map((p, i) => (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => i < phase && setPhase(i)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    i === phase
                      ? "bg-blue text-white"
                      : i < phase
                        ? "bg-blue-50 text-blue hover:bg-blue-100"
                        : "bg-line text-muted",
                  )}
                  disabled={i > phase}
                >
                  {i + 1}. {p}
                </button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* PHASE 0 — fear calibration */}
      {phase === 0 && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>ตอนนี้คุณรู้สึกอย่างไรบ้าง? 💙</CardTitle>
            <p className="text-sm text-muted">
              บอกความรู้สึกของคุณได้ตามจริง เราจะปรับน้ำเสียงและความเร่งด่วนให้เหมาะกับคุณ
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {FEAR_LEVELS.map((level) => {
              const active = fearId === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFearId(level.id)}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-2xl border-2 p-4 text-left transition-all",
                    active
                      ? "border-blue bg-blue-50/60 shadow-sm"
                      : "border-line bg-white hover:border-blue/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">{level.emoji}</span>
                    <span className="font-semibold text-ink">{level.label}</span>
                  </div>
                  <Badge variant="warning">{level.urgencyBadge}</Badge>
                  <p className="text-xs leading-relaxed text-muted">{level.tone}</p>
                </button>
              );
            })}
          </CardContent>
          <div className="flex justify-end p-5 pt-0">
            <Button onClick={goNext} disabled={!fearId}>
              เลือกแล้ว ไปต่อ →
            </Button>
          </div>
        </Card>
      )}

      {/* PHASE 1 — category selection */}
      {phase === 1 && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เรื่องของคุณเกี่ยวกับอะไร? 📚</CardTitle>
            <p className="text-sm text-muted">เลือกหมวดที่ใกล้เคียงที่สุด</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LEGAL_CATEGORIES.map((cat) => {
              const active = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all",
                    active
                      ? "border-blue bg-blue-50/60 shadow-sm"
                      : "border-line bg-white hover:border-blue/40",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
                  <span className="text-sm font-medium text-ink">{cat.title}</span>
                </button>
              );
            })}
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext} disabled={!categoryId}>
              ไปต่อ →
            </Button>
          </div>
        </Card>
      )}

      {/* PHASE 2 — questions */}
      {phase === 2 && category && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>
              เล่าเรื่องของคุณให้เราฟังหน่อย {category.icon}
            </CardTitle>
            <p className="text-sm text-muted">
              คำตอบของคุณจะช่วยให้ AI วิเคราะห์ได้ตรงจุดมากขึ้น (ทุกอย่างเป็นความลับตาม PDPA)
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">กรณีใดตรงกับคุณมากที่สุด?</p>
              <div className="flex flex-wrap gap-2">
                {category.subProblems.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setSubProblem(sp.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      subProblem === sp.id
                        ? "border-blue bg-blue text-white"
                        : "border-line bg-white text-ink/80 hover:border-blue/40",
                    )}
                  >
                    {sp.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="narrative" className="mb-2 block text-sm font-semibold text-ink">
                เล่าเหตุการณ์โดยย่อ (เกิดขึ้นเมื่อไหร่ อย่างไร)
              </label>
              <textarea
                id="narrative"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={4}
                placeholder="เช่น “เมื่อวานฉันซื้อของออนไลน์แล้วโอนเงินไป 5,000 บาท แต่ไม่ได้รับของ...”"
                className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={() => { setAnalysis("idle"); goNext(); }}>
              วิเคราะห์ให้หน่อย 🤖
            </Button>
          </div>
        </Card>
      )}

      {/* PHASE 3 — AI analysis (loading / error / success) */}
      {phase === 3 && (
        <Card variant="base">
          <CardContent className="flex flex-col gap-4 py-8">
            {analysis === "idle" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-2xl">
                  🤖
                </div>
                <p className="text-center text-sm text-muted">
                  พร้อมให้ AI วิเคราะห์ปัญหา “{category?.title}” ของคุณแล้ว
                </p>
                <Button onClick={startAnalysis}>เริ่มวิเคราะห์</Button>
              </div>
            )}

            {analysis === "loading" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <LoadingSpinner label="AI กำลังวิเคราะห์สิทธิและขั้นตอนของคุณ..." />
              </div>
            )}

            {analysis === "error" && (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">😕</div>
                <h3 className="text-base font-semibold text-ink">วิเคราะห์ไม่สำเร็จ</h3>
                <p className="max-w-sm text-sm text-muted">
                  เรายังมีข้อมูลไม่พอ กรุณาเล่าเหตุการณ์เพิ่มอีกนิด (อย่างน้อยสักประโยค)
                  เพื่อให้ AI วิเคราะห์ได้ถูกต้อง
                </p>
                <div className="mt-1 flex gap-2">
                  <Button variant="secondary" onClick={() => setPhase(2)}>
                    ← กลับไปเล่าเพิ่ม
                  </Button>
                  <Button onClick={startAnalysis}>ลองใหม่</Button>
                </div>
              </div>
            )}

            {analysis === "success" && (
              <div className="flex flex-col items-center gap-2 py-2 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-green/10 text-2xl">✅</div>
                <h3 className="text-base font-semibold text-ink">วิเคราะห์เสร็จแล้ว!</h3>
                <p className="max-w-sm text-sm text-muted">
                  เราพร้อมอธิบายสิทธิของคุณในขั้นตอนถัดไป
                </p>
                <Button onClick={goNext} className="mt-2">ดูสิทธิของฉัน →</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PHASE 4 — rights */}
      {phase === 4 && category && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>สิทธิของคุณ {category.icon}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-ink/90">
              จากหมวด “{category.title}” กฎหมายไทยให้ความคุ้มครองคุณ —
              {fear ? ` เราเข้าใจว่าคุณ${fear.label} เรื่องนี้จัดการได้แน่นอน` : " เรื่องนี้จัดการได้แน่นอน"}
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

      {/* PHASE 5 — choose path */}
      {phase === 5 && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>คุณอยากดำเนินการแบบไหน? 🧭</CardTitle>
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
                  pathChoice === opt.id
                    ? "border-blue bg-blue-50/60 shadow-sm"
                    : "border-line bg-white hover:border-blue/40",
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
            <Button onClick={goNext} disabled={!pathChoice}>
              ไปต่อ →
            </Button>
          </div>
        </Card>
      )}

      {/* PHASE 6 — next steps */}
      {phase === 6 && category && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>ขั้นตอนถัดไปที่แนะนำ 🗺️</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ol className="flex flex-col gap-2">
              {[
                "รวบรวมหลักฐานที่เกี่ยวข้องทั้งหมด (ภาพหน้าจอ ข้อความ เอกสาร)",
                `เตรียมเอกสารที่เกี่ยวข้องกับ “${category.title}” จากไลบรารีเอกสาร`,
                pathChoice === "lawyer" ? "เลือกและติดต่อทนายความผู้เชี่ยวชาญ" : "ดำเนินการตามขั้นตอนที่แนะนำ",
                "ติดตามความคืบหน้าและกำหนดวันสำคัญ",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext}>ดูสรุปผล →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 7 — summary / success */}
      {phase === 7 && category && (
        <Card variant="base">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green/10 text-3xl">🎉</div>
            <h3 className="text-lg font-semibold text-ink">เสร็จสิ้นการวินิจฉัย!</h3>
            <p className="max-w-md text-sm text-muted">
              คุณเข้าใจสิทธิและขั้นตอนของปัญหา “{category.title}” มากขึ้นแล้ว
              เก่งมากที่กล้าก้าวเข้ามาขอความช่วยเหลือ 💪
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/documents">
                <Button variant="primary">📄 ไปทำเอกสาร</Button>
              </Link>
              <Link href="/concierge">
                <Button variant="outline">🧭 ใช้ Concierge ต่อ</Button>
              </Link>
              <Button variant="ghost" onClick={() => { setPhase(0); setFearId(null); setCategoryId(null); setSubProblem(null); setNarrative(""); setAnalysis("idle"); setPathChoice(null); }}>
                เริ่มวินิจฉัยใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
