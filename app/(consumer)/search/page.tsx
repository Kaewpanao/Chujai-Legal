"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { buildSearchResult, type SearchResult } from "@/lib/legal/search";
import { DOCUMENT_CATEGORIES } from "@/lib/documents/categories";
import { sourceForCategory } from "@/lib/legal/sources";

type SearchState = "idle" | "loading" | "success" | "error";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  const runSearch = useCallback((q: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setState("error");
      setError("กรุณาพิมพ์คำค้นหาอย่างน้อย 2 ตัวอักษร เพื่อให้เราช่วยได้ตรงจุดนะคะ");
      return;
    }
    setState("loading");
    setError("");
    // Simulate the AI search round-trip (stand-in for /api/ai/search).
    timer.current = setTimeout(() => {
      setResult(buildSearchResult(q));
      setState("success");
    }, 900);
  }, []);

  // Read `?q=` from the URL (set by the home page search form) on first mount.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") ?? "";
    if (initial) {
      setQuery(initial);
      runSearch(initial);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
      {/* Main column */}
      <div className="flex flex-col gap-5">
        <section aria-label="ค้นหากฎหมายด้วยภาษาคน">
          <h2 className="text-lg font-semibold text-ink">ค้นหากฎหมายด้วยภาษาคน</h2>
          <p className="text-sm text-muted">
            พิมพ์เรื่องของคุณเป็นคำพูดธรรมดา AI จะแปลเป็นสิทธิและขั้นตอนที่เข้าใจง่าย
          </p>

          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="search-q" className="sr-only">
              คำค้นหา
            </label>
            <Input
              id="search-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="เช่น “ถูกโกงโอนเงิน” “ถูกเลิกจ้าง” “เช่าบ้านโดนไล่”"
              className="h-12 flex-1"
            />
            <Button type="submit" size="lg" className="h-12" disabled={state === "loading"}>
              {state === "loading" ? "กำลังค้นหา..." : "🔍 ค้นหา"}
            </Button>
          </form>
        </section>

        {/* Idle / empty state */}
        {state === "idle" && (
          <Card variant="base">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-2xl">
                🔎
              </div>
              <h3 className="text-base font-semibold text-ink">เริ่มพิมพ์คำค้นหาด้านบน</h3>
              <p className="max-w-md text-sm text-muted">
                เราเข้าใจว่าเรื่องกฎหมายอาจฟังดูน่ากลัว แต่ไม่ต้องกังวล —
                เล่าแบบที่คุณเล่าให้เพื่อนฟังก็พอ
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {state === "loading" && (
          <Card variant="base">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <LoadingSpinner label="กำลังวิเคราะห์คำถามของคุณ..." />
              <p className="text-xs text-muted">ใช้เวลาเพียงไม่กี่วินาที</p>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {state === "error" && (
          <Card variant="urgent">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">
                😕
              </div>
              <h3 className="text-base font-semibold text-ink">ยังค้นหาไม่สำเร็จ</h3>
              <p className="max-w-md text-sm text-muted">{error}</p>
              <Button variant="secondary" onClick={() => runSearch(query)} className="mt-1">
                ลองใหม่อีกครั้ง
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success / result card */}
        {state === "success" && result && (
          <div className="flex flex-col gap-4">
            <Card variant="base">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant={result.matched ? "success" : "neutral"} icon="🤖">
                    {result.matched ? "AI ตอบกลับ" : "ยังไม่พบหมวดที่ตรง"}
                  </Badge>
                  {result.categoryTitle && (
                    <Badge variant="info" icon="📚">
                      {result.categoryTitle}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-ink/90">{result.answer}</p>

                {result.sources.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-ink">📖 แหล่งอ้างอิงกฎหมาย</h4>
                    <ul className="flex flex-col gap-1.5">
                      {result.sources.map((s, i) => (
                        <li
                          key={i}
                          className="rounded-lg bg-blue-50/60 px-3 py-2 text-xs text-ink/80"
                        >
                          <span className="font-medium text-blue-dark">
                            {s.lawName} {s.ref}
                          </span>
                          {" — "}
                          {s.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.nextSteps.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-ink">🧭 ขั้นตอนถัดไป</h4>
                    <ol className="flex flex-col gap-1.5">
                      {result.nextSteps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink/80">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue text-[11px] font-semibold text-white">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link href="/diagnosis">
                    <Button variant="outline" size="sm">
                      วินิจฉัยแบบละเอียด →
                    </Button>
                  </Link>
                  <Link href="/lawyers">
                    <Button variant="secondary" size="sm">
                      ดูทนายความที่เชี่ยวชาญ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <LegalDisclaimer />
          </div>
        )}
      </div>

      {/* Document category sidebar */}
      <aside className="hidden lg:block" aria-label="หมวดเอกสาร">
        <Card variant="base" className="sticky top-20">
          <CardHeader>
            <CardTitle>📄 หมวดเอกสารที่เกี่ยวข้อง</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {DOCUMENT_CATEGORIES.map((doc) => (
              <Link
                key={doc.id}
                href="/documents"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/80 transition-colors hover:bg-canvas"
              >
                <span aria-hidden="true">{doc.icon}</span>
                <span className="flex-1 truncate">{doc.title}</span>
              </Link>
            ))}
            <Link href="/documents" className="mt-1 px-2 text-xs font-medium text-blue hover:underline">
              ดูเอกสารทั้งหมด →
            </Link>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
