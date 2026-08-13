"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { LEGAL_CATEGORIES, getCategoryById } from "@/lib/legal/categories";
import { sourceForCategory } from "@/lib/legal/sources";
import { getQuestions, type DiagnosisQuestion } from "@/lib/legal/questions";
import { getSolution } from "@/lib/legal/solutions";
import {
  runDiagnosis,
  type DiagnosisResult,
} from "@/lib/legal/diagnosis";
import { cn } from "@/lib/utils";

const PHASES = [
  "เข้าใจปัญหา",
  "ตอบคำถาม",
  "วิเคราะห์ AI",
  "เลือกเส้นทาง",
  "เขตอำนาจ",
  "เอกสาร",
  "เตรียมตัว",
  "ยื่นเรื่อง",
  "ติดตามผล",
];

const ACTION_PACK_PRICE = 299;

type AnalysisStatus = "idle" | "loading" | "success" | "error";
type PayStep = "intro" | "qr" | "processing" | "done";

const PATH_OPTIONS = [
  { id: "self", icon: "🧑‍💻", title: "ทำเอง", desc: "ใช้เอกสารและขั้นตอนจากชูใจ ดำเนินการด้วยตัวเอง" },
  { id: "lawyer", icon: "⚖️", title: "ปรึกษาทนาย", desc: "ให้ทนายผู้เชี่ยวชาญช่วยดูแลเคสของคุณ" },
  { id: "mediation", icon: "🤝", title: "ไกล่เกลี่ย", desc: "เจรจาตกลงกันโดยไม่ต้องขึ้นศาล" },
];

export default function ConciergePage() {
  const [phase, setPhase] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subProblemId, setSubProblemId] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pathChoice, setPathChoice] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysis, setAnalysis] = useState<DiagnosisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  // Payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [payStep, setPayStep] = useState<PayStep>("intro");
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [payMock, setPayMock] = useState(false);
  const [payError, setPayError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const category = categoryId ? getCategoryById(categoryId) : null;
  const source = category ? sourceForCategory(category.id) : null;
  const solution = category ? getSolution(category.id) : undefined;
  const questions: DiagnosisQuestion[] = category ? getQuestions(category.id) : [];
  const subProblem = category?.subProblems.find((sp) => sp.id === subProblemId) ?? null;

  const goNext = useCallback(
    () => setPhase((p) => Math.min(PHASES.length - 1, p + 1)),
    [],
  );
  const goBack = () => setPhase((p) => Math.max(0, p - 1));

  const pct = Math.round(((phase + 1) / PHASES.length) * 100);
  const gated = !paid && phase >= 4;

  // Clear the poll interval on unmount.
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ----------------------- diagnosis question helpers --------------------- */

  const currentQuestion = questions[Math.min(qIndex, questions.length - 1)];
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
    if (!currentQuestion) return false;
    return currentSelected.length > 0;
  }

  function nextQuestion() {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    }
  }
  function prevQuestion() {
    if (qIndex > 0) {
      setQIndex((i) => i - 1);
    }
  }

  const answersForAi = useCallback((): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers)) {
      map[k] = v.split("|").join(", ");
    }
    if (narrative.trim()) map["narrative"] = narrative.trim();
    return map;
  }, [answers, narrative]);

  /* ------------------------------ AI analysis ----------------------------- */

  const analysisStarted = useRef(false);
  useEffect(() => {
    if (phase === 2 && analysisStatus === "idle" && !analysisStarted.current) {
      analysisStarted.current = true;
      void runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, analysisStatus]);

  async function runAnalysis() {
    if (!category) return;
    setAnalysisStatus("loading");
    setAnalysisError("");
    try {
      const result = await runDiagnosis({
        categoryId: category.id,
        subProblem: subProblem?.title ?? category.title,
        answers: answersForAi(),
      });
      setAnalysis(result);
      setAnalysisStatus("success");
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "การวิเคราะห์ล้มเหลว โปรดลองอีกครั้ง");
      setAnalysisStatus("error");
    }
  }

  /* ------------------------------ payment flow ---------------------------- */

  async function createPayment() {
    setPayStep("processing");
    setPayError("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: ACTION_PACK_PRICE,
          packageId: "action",
          description: `Action Pack — ปลดล็อกขั้นตอน 4–8 (${category?.title ?? "เคสทั่วไป"})`,
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        payment?: { id: string; qr?: string };
        mock?: boolean;
      };
      if (!res.ok || !body.payment) {
        throw new Error(body.error ?? "สร้างรายการชำระเงินไม่สำเร็จ");
      }
      setChargeId(body.payment.id);
      setQrUrl(body.payment.qr ?? null);
      setPayMock(Boolean(body.mock));
      setPayStep("qr");
      startPolling(body.payment.id);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "สร้างรายการชำระเงินไม่สำเร็จ");
      setPayStep("intro");
    }
  }

  function startPolling(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => void verifyPayment(id), 3000);
  }

  async function verifyPayment(id: string) {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chargeId: id }),
      });
      const body = (await res.json()) as { payment?: { paid?: boolean } };
      if (body.payment?.paid) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPaid(true);
        setPayStep("done");
        // Unlock the gated phases and advance.
        setTimeout(() => {
          setPayOpen(false);
          setPhase(4);
        }, 900);
      }
    } catch {
      /* keep polling */
    }
  }

  function manualUnlock() {
    if (pollRef.current) clearInterval(pollRef.current);
    setPaid(true);
    setPayOpen(false);
    setPhase(4);
  }

  function handlePathNext() {
    if (paid) {
      goNext();
    } else {
      setPayStep("intro");
      setPayOpen(true);
    }
  }

  const resetAll = () => {
    setPhase(0);
    setCategoryId(null);
    setSubProblemId(null);
    setNarrative("");
    setQIndex(0);
    setAnswers({});
    setPathChoice(null);
    setPaid(false);
    setAnalysisStatus("idle");
    setAnalysis(null);
    setAnalysisError("");
    analysisStarted.current = false;
    setPayStep("intro");
    setChargeId(null);
    setQrUrl(null);
  };

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

      {/* PHASE 0 — understand: category → sub-problem → narrative */}
      {phase === 0 && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เล่าเรื่องของคุณให้เราฟัง 💬</CardTitle>
            <p className="text-sm text-muted">
              เราเข้าใจว่าการเจอปัญหากฎหมายมันหนักใจ — เริ่มจากเลือกหมวดและปัญหาที่ตรงกับคุณที่สุด
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
                    onClick={() => {
                      setCategoryId(cat.id);
                      setSubProblemId(null);
                    }}
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

            {category && (
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">
                  ปัญหาของคุณคือข้อไหน? (เลือก 1 ข้อ)
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.subProblems.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setSubProblemId(sp.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        subProblemId === sp.id
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
            <Button onClick={goNext} disabled={!categoryId || !subProblemId}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 1 — 4 diagnosis questions (one by one) */}
      {phase === 1 && category && currentQuestion && (
        <Card variant="base">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ตอบคำถามสั้น ๆ หน่อย {category.icon}</CardTitle>
              <Badge variant="neutral">คำถาม {qIndex + 1}/{questions.length}</Badge>
            </div>
            <p className="text-sm text-muted">
              คำตอบของคุณช่วยให้ AI วิเคราะห์ได้ตรงจุด (ข้อมูลเป็นความลับตาม PDPA)
            </p>
            <Progress value={Math.round(((qIndex + 1) / questions.length) * 100)} showValue={false} />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs",
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
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={qIndex === 0 ? goBack : prevQuestion}>
              ← ย้อนกลับ
            </Button>
            {qIndex < questions.length - 1 ? (
              <Button onClick={nextQuestion} disabled={!canAdvanceQuestion()}>ถัดไป →</Button>
            ) : (
              <Button onClick={goNext} disabled={!canAdvanceQuestion()}>
                วิเคราะห์ให้หน่อย 🤖
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* PHASE 2 — AI analysis */}
      {phase === 2 && category && (
        <Card variant="base">
          <CardContent className="flex flex-col gap-4 py-8">
            {analysisStatus === "idle" || analysisStatus === "loading" ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-2xl">🤖</div>
                <LoadingSpinner label="AI กำลังวิเคราะห์สิทธิและขั้นตอนของคุณ..." />
              </div>
            ) : analysisStatus === "error" ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">😕</div>
                <h3 className="text-base font-semibold text-ink">วิเคราะห์ไม่สำเร็จ</h3>
                <p className="max-w-sm text-sm text-muted">{analysisError}</p>
                <div className="mt-1 flex gap-2">
                  <Button variant="secondary" onClick={() => setPhase(1)}>← กลับไปแก้คำตอบ</Button>
                  <Button onClick={runAnalysis}>ลองใหม่</Button>
                </div>
              </div>
            ) : analysis ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-green/10 text-2xl">✅</div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">วิเคราะห์เสร็จแล้ว</h3>
                    <p className="text-xs text-muted">
                      {analysis.aiGenerated
                        ? `สร้างโดย AI (${analysis.model ?? "DeepSeek"}) · ตรวจความปลอดภัยแล้ว`
                        : "สร้างจากฐานข้อมูลกฎหมายชูใจ"}
                    </p>
                  </div>
                </div>

                {/* 1. Empathy opening — big and warm */}
                {analysis.empathy && (
                  <p className="rounded-2xl bg-blue-50/70 px-4 py-3 text-base font-semibold leading-relaxed text-ink">
                    💙 {analysis.empathy}
                  </p>
                )}

                <p className="rounded-xl bg-canvas px-4 py-3 text-sm leading-relaxed text-ink/90">
                  {analysis.summary}
                </p>

                {/* 2. Step-by-step — numbered warm cards */}
                {analysis.stepByStep?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink">📋 ขั้นตอนที่คุณทำเองได้</p>
                    <ol className="flex flex-col gap-2">
                      {analysis.stepByStep.map((s, i) => (
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
                {analysis.reassurance && (
                  <p className="rounded-xl bg-green/10 px-4 py-3 text-sm font-medium leading-relaxed text-ink/90">
                    💪 {analysis.reassurance}
                  </p>
                )}

                {/* 4. Rights — warm */}
                <div>
                  <p className="text-sm font-semibold text-ink">🛡️ สิทธิของคุณ</p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {analysis.rights.map((r, i) => (
                      <li key={i} className="rounded-lg bg-blue-50/60 px-3 py-2 text-sm text-ink/85">• {r}</li>
                    ))}
                  </ul>
                </div>

                {analysis.options.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-ink">🧭 ทางเลือกของคุณ</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {analysis.options.map((o, i) => (
                        <li key={i} className="text-sm text-ink/85">• {o}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Laws as supporting references — small, at the bottom */}
                {analysis.sources.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      📚 อ้างอิงกฎหมาย (หลักฐานสนับสนุน)
                    </p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {analysis.sources.map((s, i) => (
                        <li key={i} className="rounded-lg bg-canvas px-3 py-1.5 text-xs text-muted">
                          <span className="font-medium text-blue-dark">{s.lawName}</span>
                          {s.ref ? ` ${s.ref}` : ""} — {s.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Urgent steps (if any) */}
                {analysis.urgentSteps.length > 0 && (
                  <div className="rounded-xl bg-amber/10 px-4 py-3">
                    <p className="text-sm font-semibold text-amber">⚡ ขั้นตอนเร่งด่วน</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {analysis.urgentSteps.map((s, i) => (
                        <li key={i} className="text-sm text-ink/85">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <LegalDisclaimer />
              </div>
            ) : null}
          </CardContent>
          {analysisStatus === "success" && analysis && (
            <div className="flex justify-between p-5 pt-0">
              <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
              <Button onClick={goNext}>ดูสิทธิของฉัน →</Button>
            </div>
          )}
        </Card>
      )}

      {/* PHASE 3 — choose path (monetization gate follows) */}
      {phase === 3 && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เลือกเส้นทางดำเนินการ 🧭</CardTitle>
            <p className="text-sm text-muted">เลือกทางที่คุณสบายใจ — เราช่วยทุกทาง</p>
          </CardHeader>
          <CardContent className="grid gap-3">
            {PATH_OPTIONS.map((opt) => (
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
            <Button onClick={handlePathNext} disabled={!pathChoice}>
              {paid ? "ไปต่อ →" : "ปลดล็อกขั้นตอนถัดไป →"}
            </Button>
          </div>
        </Card>
      )}

      {/* MONETIZATION GATE — phases 4–8 require Action Pack */}
      {gated && (
        <Card variant="base" className="border-2 border-blue/30">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-3xl">🔒</div>
            <h3 className="text-lg font-semibold text-ink">
              ขั้นตอนที่ 4–8 เป็นสิทธิ์ของแพ็กเกจ Action Pack
            </h3>
            <p className="max-w-md text-sm text-muted">
              เขตอำนาจศาล รายการเอกสาร การเตรียมตัว การยื่น และติดตามผล
              จะถูกปลดล็อกเพื่อพาคุณไปจนจบเคสอย่างมั่นใจ
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="upgrade" onClick={() => { setPayStep("intro"); setPayOpen(true); }}>
                💎 ปลดล็อก Action Pack (฿299)
              </Button>
              <Button variant="secondary" onClick={manualUnlock}>
                ฉันมีแพ็กเกจแล้ว → ปลดล็อก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PHASE 4 — jurisdiction (gated) */}
      {phase === 4 && !gated && solution && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เขตอำนาจศาล / หน่วยงาน 📍</CardTitle>
            <p className="text-sm text-muted">คุณควรไปยื่นเรื่องหรือติดต่อที่ไหน</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="rounded-lg bg-blue-50/60 px-3 py-2 text-sm text-ink/90">
              🏛️ <span className="font-semibold text-blue-dark">ศาล/หน่วยงานหลัก:</span> {solution.court}
            </p>
            <p className="rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber">⚡ {solution.urgent}</p>
            <ul className="flex flex-col gap-2">
              {solution.jurisdiction.map((j, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-canvas px-3 py-2 text-sm text-ink/85">
                  <span className="text-blue" aria-hidden="true">▸</span>
                  <span>{j}</span>
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

      {/* PHASE 5 — documents (gated) */}
      {phase === 5 && !gated && solution && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>รายการเอกสารที่ต้องเตรียม 📄</CardTitle>
            <p className="text-sm text-muted">
              จากหมวด “{category?.title}” และเส้นทาง “{pathChoice === "lawyer" ? "ปรึกษาทนาย" : pathChoice === "mediation" ? "ไกล่เกลี่ย" : "ทำเอง"}”
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ul className="flex flex-col gap-2">
              {solution.documents.map((doc, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2 text-sm text-ink/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-semibold text-white">{i + 1}</span>
                  <span className="flex-1">{doc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-muted">
              💡 เอกสารบางรายการสร้างได้จาก <Link href="/documents" className="font-medium text-blue hover:underline">ไลบรารีเอกสาร →</Link>
            </p>
          </CardContent>
          <div className="flex justify-between p-5 pt-0">
            <Button variant="ghost" onClick={goBack}>← ย้อนกลับ</Button>
            <Button onClick={goNext}>ไปต่อ →</Button>
          </div>
        </Card>
      )}

      {/* PHASE 6 — preparation (gated) */}
      {phase === 6 && !gated && solution && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>เตรียมตัวก่อนยื่น 📝</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ol className="flex flex-col gap-2">
              {solution.preparation.map((step, i) => (
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

      {/* PHASE 7 — filing (gated) */}
      {phase === 7 && !gated && solution && (
        <Card variant="base">
          <CardHeader>
            <CardTitle>ยื่นเรื่อง 🚀</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ol className="flex flex-col gap-2">
              {solution.filing.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-semibold text-white">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
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

      {/* PHASE 8 — follow-up / success (gated) */}
      {phase === 8 && !gated && solution && (
        <Card variant="base">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green/10 text-3xl">🎉</div>
            <h3 className="text-lg font-semibold text-ink">Concierge พาคุณมาถึงจุดนี้แล้ว!</h3>
            <p className="max-w-md text-sm text-muted">
              เคส “{category?.title}” ของคุณถูกบันทึกไว้ในระบบแล้ว เราจะช่วยติดตามความคืบหน้าให้คุณ
            </p>
            <div className="w-full max-w-sm text-left">
              <p className="mb-2 text-sm font-semibold text-ink">📊 ขั้นตอนติดตามผล</p>
              <ul className="flex flex-col gap-2">
                {solution.followUp.map((step, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm text-ink/85">
                    <span aria-hidden="true">🔔</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/notifications">
                <Button variant="primary">🔔 ดูการแจ้งเตือน</Button>
              </Link>
              <Button variant="ghost" onClick={resetAll}>เริ่มเคสใหม่</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PAYMENT MODAL — PromptPay */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <Card variant="base" className="w-full max-w-md">
            <CardContent className="flex flex-col gap-4 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">💎 Action Pack — ฿299</h3>
                  <p className="text-sm text-muted">ปลดล็อกขั้นตอน 4–8 ของเคสคุณทันที</p>
                </div>
                <button type="button" onClick={() => setPayOpen(false)} className="text-muted hover:text-ink" aria-label="ปิด">
                  ✕
                </button>
              </div>

              {payStep === "intro" && (
                <>
                  <ul className="flex flex-col gap-1.5 text-sm text-ink/85">
                    <li>✅ เขตอำนาจศาล / หน่วยงานที่ต้องติดต่อ</li>
                    <li>✅ รายการเอกสารครบถ้วน</li>
                    <li>✅ ขั้นตอนเตรียมตัว + ยื่นเรื่อง + ติดตามผล</li>
                  </ul>
                  <p className="rounded-lg bg-canvas px-3 py-2 text-xs text-muted">
                    ถูกกว่าจ้างทนาย 98% — ทนายคิดหลักหมื่น แต่ที่นี่แค่ค่ากาแฟ 2 แก้ว
                  </p>
                  {payError && <p className="rounded-lg bg-red/10 px-3 py-2 text-xs text-red">{payError}</p>}
                  <Button variant="upgrade" size="lg" className="w-full" onClick={createPayment}>
                    💳 จ่ายด้วย PromptPay
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={manualUnlock}>
                    ฉันจ่ายแล้ว / มีแพ็กเกจ → ตรวจสอบ
                  </Button>
                </>
              )}

              {payStep === "processing" && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <LoadingSpinner label="กำลังสร้าง QR ชำระเงิน..." />
                </div>
              )}

              {(payStep === "qr" || payStep === "done") && (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <div className="grid h-48 w-48 place-items-center rounded-2xl border-2 border-line bg-white">
                      {qrUrl && !payMock ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrUrl} alt="PromptPay QR" className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <span className="text-5xl" aria-hidden="true">📱</span>
                          <span className="text-xs font-semibold text-ink">QR PromptPay</span>
                          <span className="px-2 text-[10px] leading-tight text-muted">
                            {payMock ? "โหมดทดสอบ (ยังไม่ได้เชื่อม Omise)" : "สแกนเพื่อชำระเงิน"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-sm font-semibold text-ink">฿299</p>
                    {chargeId && <p className="text-center text-xs text-muted">รหัส: {chargeId}</p>}
                    {payStep === "qr" && (
                      <p className="text-center text-xs text-muted">
                        สแกนจ่ายแล้วระบบจะตรวจสอบให้อัตโนมัติ — ไม่ต้องกดอะไร
                      </p>
                    )}
                    {payStep === "done" && (
                      <p className="rounded-lg bg-green/10 px-3 py-2 text-xs text-green">
                        ✅ ชำระเงินสำเร็จ กำลังปลดล็อก...
                      </p>
                    )}
                  </div>
                  {payStep === "qr" && (
                    <Button variant="secondary" className="w-full" onClick={() => void (chargeId && verifyPayment(chargeId))}>
                      ตรวจสอบสถานะการชำระ
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
