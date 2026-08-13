"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LEGAL_CATEGORIES, getCategoryById } from "@/lib/legal/categories";
import { FEAR_LEVELS } from "@/lib/legal/fear-calibration";
import { getQuestions, type DiagnosisQuestion } from "@/lib/legal/questions";
import { runDiagnosis, type DiagnosisResult } from "@/lib/legal/diagnosis";
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
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<AnalysisState>("idle");
  const [analysisError, setAnalysisError] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [pathChoice, setPathChoice] = useState<string | null>(null);

  // Prefill category from ?category=<id> (linked from the home grid).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat && getCategoryById(cat)) {
      setCategoryId(cat);
      setPhase(1); // skip fear calibration when arriving via a category link
    }
  }, []);

  const category = categoryId ? getCategoryById(categoryId) : null;
  const questions: DiagnosisQuestion[] = category ? getQuestions(category.id) : [];

  const goNext = () => setPhase((p) => Math.min(PHASES.length - 1, p + 1));
  const goBack = () => setPhase((p) => Math.max(0, p - 1));

  const pct = Math.round(((phase + 1) / PHASES.length) * 100);

  /* ----------------------- diagnosis question helpers --------------------- */

  const currentQuestion = questions[Math.min(qIndex, Math.max(0, questions.length - 1))];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? "" : "";
  const currentSelected = currentAnswer ? currentAnswer.split("|").filter(Boolean) : [];

  function commitAnswer(value: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function toggleOption(option: string) {
    if (!currentQuestion) return;
    const next = currentSelected.includes(option)
      ? currentSelected.filter((o) => o !== option)
      : [...currentSelected, option];
    commitAnswer(next.join("|"));
  }

  function canAdvanceQuestion(): boolean {
    return currentQuestion ? currentSelected.length > 0 : false;
  }

  /* ------------------------------ AI analysis ----------------------------- */

  const startedRef = useRef(false);

  async function runAnalysis() {
    if (!category) return;
    setAnalysis("loading");
    setAnalysisError("");
    try {
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(answers)) {
        payload[k] = v.split("|").join(", ");
      }
      if (narrative.trim()) payload["narrative"] = narrative.trim();

      const subTitle = category.subProblems.find((sp) => sp.id === subProblem)?.title;

      const res = await runDiagnosis({
        categoryId: category.id,
        subProblem: subTitle ?? category.title,
        answers: payload,
        fearLevel: fearId ?? undefined,
      });
      setResult(res);
      setAnalysis("success");
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "การวิเคราะห์ล้มเหลว โปรดลองอีกครั้ง");
      setAnalysis("error");
    }
  }

  // Auto-run analysis when entering the analysis phase.
  useEffect(() => {
    if (phase === 3 && analysis === "idle" && !startedRef.current) {
      startedRef.current = true;
      void runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, analysis]);

  const resetAll = () => {
    setPhase(0);
    setFearId(null);
    setCategoryId(null);
    setSubProblem(null);
    setNarrative("");
    setQIndex(0);
    setAnswers({});
    setAnalysis("idle");
    setAnalysisError("");
    setResult(null);
    setPathChoice(null);
    startedRef.current = false;
  };

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
                  onClick={() => {
                    setCategoryId(cat.id);
                    setSubProblem(null);
                  }}
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

      {/* PHASE 2 — sub-problem + 4 diagnosis questions */}
      {phase === 2 && category && currentQuestion && (
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ตอบคำถามสั้น ๆ หน่อย {category.icon}</CardTitle>
              <Badge variant="neutral">คำถาม {qIndex + 1}/{questions.length}</Badge>
            </div>
            <p className="text-sm text-muted">
              คำตอบของคุณช่วยให้ AI วิเคราะห์ได้ตรงจุด (ทุกอย่างเป็นความลับตาม PDPA)
            </p>
            <Progress value={Math.round(((qIndex + 1) / questions.length) * 100)} showValue={false} />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Sub-problem chips (shown on first question) */}
            {qIndex === 0 && (
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
            )}

            <div>
              <h3 className="text-base font-semibold text-ink">{currentQuestion.title}</h3>
              <p className="mt-1 text-xs text-muted">💡 {currentQuestion.rationale}</p>
            </div>

            <div className="flex flex-col gap-2">
              {currentQuestion.options.map((opt) => {
                const active = currentSelected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      currentQuestion.multi ? toggleOption(opt) : commitAnswer(opt)
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all",
                      active ? "border-blue bg-blue-50/60 shadow-sm" : "border-line bg-white hover:border-blue/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center border text-xs",
                        currentQuestion.multi ? "rounded" : "rounded-full",
                        active ? "border-blue bg-blue text-white" : "border-line text-transparent",
                      )}
                    >
                      ✓
                    </span>
                    <span className="text-ink/90">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Narrative (optional, on last question) */}
            {qIndex === questions.length - 1 && (
              <div>
                <label htmlFor="diag-narrative" className="mb-2 block text-sm font-semibold text-ink">
                  เล่าเหตุการณ์เพิ่มเติม (ไม่บังคับ)
                </label>
                <textarea
                  id="diag-narrative"
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  rows={3}
                  placeholder="เช่น “เมื่อวานฉันซื้อของออนไลน์แล้วโอนเงินไป 5,000 บาท แต่ไม่ได้รับของ...”"
                  className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
              </div>
            )}
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={qIndex === 0 ? goBack : () => setQIndex((i) => i - 1)}>
              ← ย้อนกลับ
            </Button>
            {qIndex < questions.length - 1 ? (
              <Button onClick={() => setQIndex((i) => i + 1)} disabled={!canAdvanceQuestion()}>ถัดไป →</Button>
            ) : (
              <Button onClick={() => { setAnalysis("idle"); goNext(); }} disabled={!canAdvanceQuestion()}>
                วิเคราะห์ให้หน่อย 🤖
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* PHASE 3 — AI analysis */}
      {phase === 3 && (
        <Card variant="base">
          <CardContent className="flex flex-col gap-4 py-8">
            {(analysis === "idle" || analysis === "loading") && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-2xl">🤖</div>
                <LoadingSpinner label="AI กำลังวิเคราะห์สิทธิและขั้นตอนของคุณ..." />
              </div>
            )}

            {analysis === "error" && (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">😕</div>
                <h3 className="text-base font-semibold text-ink">วิเคราะห์ไม่สำเร็จ</h3>
                <p className="max-w-sm text-sm text-muted">{analysisError}</p>
                <div className="mt-1 flex gap-2">
                  <Button variant="secondary" onClick={() => setPhase(2)}>
                    ← กลับไปแก้คำตอบ
                  </Button>
                  <Button onClick={runAnalysis}>ลองใหม่</Button>
                </div>
              </div>
            )}

            {analysis === "success" && result && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-green/10 text-2xl">✅</div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">วิเคราะห์เสร็จแล้ว!</h3>
                    <p className="text-xs text-muted">
                      {result.aiGenerated
                        ? `สร้างโดย AI (${result.model ?? "DeepSeek"}) · ตรวจความปลอดภัยแล้ว`
                        : "สร้างจากฐานข้อมูลกฎหมายชูใจ"}
                    </p>
                  </div>
                </div>
                {result.empathy && (
                  <p className="rounded-2xl bg-blue-50/70 px-4 py-3 text-base font-semibold leading-relaxed text-ink">
                    💙 {result.empathy}
                  </p>
                )}
                <p className="rounded-xl bg-canvas px-4 py-3 text-sm leading-relaxed text-ink/90">{result.summary}</p>
                {result.urgentSteps.length > 0 && (
                  <div className="rounded-xl bg-amber/10 px-4 py-3">
                    <p className="text-sm font-semibold text-amber">⚡ ขั้นตอนเร่งด่วน</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {result.urgentSteps.map((s, i) => (
                        <li key={i} className="text-sm text-ink/85">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          {analysis === "success" && result && (
            <div className="flex justify-between p-5 pt-0">
              <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
              <Button onClick={goNext}>ดูสิทธิของฉัน →</Button>
            </div>
          )}
        </Card>
      )}

      {/* PHASE 4 — rights + warm result (from AI result) */}
      {phase === 4 && category && result && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>สิทธิและขั้นตอนของคุณ {category.icon}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* 1. Empathy opening — big and warm */}
            {result.empathy && (
              <p className="rounded-2xl bg-blue-50/70 px-4 py-3 text-base font-semibold leading-relaxed text-ink">
                💙 {result.empathy}
              </p>
            )}
            <p className="text-sm leading-relaxed text-ink/90">{result.summary}</p>

            {/* 2. Step-by-step — numbered warm cards */}
            {result.stepByStep?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">📋 ขั้นตอนที่คุณทำเองได้</p>
                <ol className="flex flex-col gap-2">
                  {result.stepByStep.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-xs font-semibold text-white">
                        {s.step || i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-ink">
                          {s.emoji ? `${s.emoji} ` : ""}{s.title}
                        </span>
                        <span className="block text-sm leading-relaxed text-muted">{s.detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* 3. Reassurance + social proof */}
            {result.reassurance && (
              <p className="rounded-xl bg-green/10 px-4 py-3 text-sm font-medium leading-relaxed text-ink/90">
                💪 {result.reassurance}
              </p>
            )}

            {/* 4. Rights — warm, explained meaning */}
            {result.rights.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-semibold text-ink">🛡️ สิทธิของคุณ</p>
                <ul className="flex flex-col gap-2">
                  {result.rights.map((r, i) => (
                    <li key={i} className="rounded-lg bg-blue-50/60 px-3 py-2 text-sm text-ink/85">• {r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Laws as supporting references — small, at the bottom */}
            {result.sources.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  📚 อ้างอิงกฎหมาย (หลักฐานสนับสนุน)
                </p>
                <ul className="flex flex-col gap-1">
                  {result.sources.map((s, i) => (
                    <li key={i} className="rounded-lg bg-canvas px-3 py-1.5 text-xs text-muted">
                      <span className="font-medium text-blue-dark">{s.lawName}</span>
                      {s.ref ? ` ${s.ref}` : ""} — {s.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. Urgent steps (if any) */}
            {result.urgentSteps.length > 0 && (
              <div className="rounded-xl bg-amber/10 px-4 py-3">
                <p className="text-sm font-semibold text-amber">⚡ ขั้นตอนเร่งด่วน</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {result.urgentSteps.map((s, i) => (
                    <li key={i} className="text-sm text-ink/85">• {s}</li>
                  ))}
                </ul>
              </div>
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

      {/* PHASE 6 — next steps (from AI options) */}
      {phase === 6 && category && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>ขั้นตอนถัดไปที่แนะนำ 🗺️</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ol className="flex flex-col gap-2">
              {(result?.options?.length
                ? result.options
                : [
                    "รวบรวมหลักฐานที่เกี่ยวข้องทั้งหมด (ภาพหน้าจอ ข้อความ เอกสาร)",
                    `เตรียมเอกสารที่เกี่ยวข้องกับ “${category.title}” จากไลบรารีเอกสาร`,
                    pathChoice === "lawyer" ? "เลือกและติดต่อทนายความผู้เชี่ยวชาญ" : "ดำเนินการตามขั้นตอนที่แนะนำ",
                    "ติดตามความคืบหน้าและกำหนดวันสำคัญ",
                  ]
              ).map((step, i) => (
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
              <Button variant="ghost" onClick={resetAll}>
                เริ่มวินิจฉัยใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
