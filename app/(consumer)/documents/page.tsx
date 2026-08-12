"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_TEMPLATES,
  getDocumentCategory,
} from "@/lib/documents/categories";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "ready" | "error";

export default function DocumentsPage() {
  const [load, setLoad] = useState<LoadState>("loading");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setLoad("ready"), 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOCUMENT_TEMPLATES.filter((doc) => {
      const matchCat = !activeCategory || doc.categoryId === activeCategory;
      const matchQ =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, activeCategory]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">คลังเอกสารกฎหมาย 📄</h2>
        <p className="text-sm text-muted">
          สร้างเอกสารทางกฎหมายด้วยการกรอกข้อมูลไม่กี่ช่อง — ไม่ต้องรู้ศัพท์กฎหมาย
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3">
        <label htmlFor="doc-search" className="sr-only">
          ค้นหาเอกสาร
        </label>
        <Input
          id="doc-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาเอกสาร เช่น “สัญญาเช่า” “ทวงหนี้”..."
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              activeCategory === null
                ? "border-blue bg-blue text-white"
                : "border-line bg-white text-ink/80 hover:border-blue/40",
            )}
          >
            ทั้งหมด
          </button>
          {DOCUMENT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                activeCategory === c.id
                  ? "border-blue bg-blue text-white"
                  : "border-line bg-white text-ink/80 hover:border-blue/40",
              )}
            >
              {c.icon} {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {load === "loading" && (
        <Card variant="base">
          <CardContent className="flex items-center justify-center py-16">
            <LoadingSpinner label="กำลังโหลดคลังเอกสาร..." />
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {load === "error" && (
        <Card variant="urgent">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">😕</div>
            <h3 className="text-base font-semibold text-ink">โหลดเอกสารไม่สำเร็จ</h3>
            <p className="text-sm text-muted">มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง</p>
            <Button variant="secondary" onClick={() => { setLoad("loading"); timer.current = setTimeout(() => setLoad("ready"), 500); }}>
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      )}

      {load === "ready" && (
        <>
          {/* 10 category grid */}
          <section aria-label="หมวดเอกสาร" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {DOCUMENT_CATEGORIES.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(active ? null : c.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 text-center transition-all",
                    active ? "border-blue bg-blue-50/60 shadow-sm" : "border-line bg-white hover:border-blue/40",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">{c.icon}</span>
                  <span className="text-sm font-medium text-ink">{c.title}</span>
                  <span className="text-xs text-muted">{c.description}</span>
                </button>
              );
            })}
          </section>

          {/* Document cards */}
          <section aria-label="เอกสารทั้งหมด">
            {filtered.length === 0 ? (
              <EmptyState
                icon="📭"
                title="ไม่พบเอกสารที่ค้นหา"
                description="ลองเปลี่ยนคำค้นหาหรือเลือกหมวดอื่นดูนะคะ"
                actionLabel="ล้างตัวกรอง"
                actionHref="/documents"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((doc) => {
                  const cat = getDocumentCategory(doc.categoryId);
                  return (
                    <Card key={doc.id} variant="hover" className="flex flex-col">
                      <CardContent className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" aria-hidden="true">{cat?.icon ?? "📄"}</span>
                          <Badge variant={doc.free ? "success" : "neutral"}>
                            {doc.free ? "ฟรี" : "Action Pack"}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-ink">{doc.title}</h3>
                        <p className="text-xs leading-relaxed text-muted">{doc.description}</p>
                        <p className="mt-auto flex items-center gap-3 text-xs text-muted">
                          <span>📝 {doc.fields} ช่อง</span>
                          <span>⏱️ ~{doc.minutes} นาที</span>
                        </p>
                        <Link href="/concierge">
                          <Button variant={doc.free ? "secondary" : "outline"} size="sm" className="w-full">
                            {doc.free ? "สร้างเอกสาร" : "🔒 ปลดล็อกด้วย Action Pack"}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <LegalDisclaimer />
        </>
      )}
    </div>
  );
}
