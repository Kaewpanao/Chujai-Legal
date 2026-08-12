"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread" | "case" | "system";
type LoadState = "loading" | "ready" | "error";

interface Notification {
  id: string;
  type: "case" | "system";
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: "n1", type: "case", icon: "📋", title: "เคสของคุณอัปเดตแล้ว", body: "เคส “ถูกโกงซื้อของออนไลน์” เข้าสู่ขั้นตอนรวบรวมหลักฐานแล้ว", time: "2 ชั่วโมงที่แล้ว", read: false },
  { id: "n2", type: "case", icon: "⚖️", title: "ทนายตอบกลับคุณ", body: "ทนายปริญญา ใจดี ตอบกลับข้อความของคุณในเคสภัยออนไลน์", time: "5 ชั่วโมงที่แล้ว", read: false },
  { id: "n3", type: "system", icon: "🔔", title: "ครบกำหนดยื่นเอกสาร", body: "เอกสาร “หนังสือทวงหนี้” ใกล้ถึงกำหนดส่ง กรุณาตรวจสอบ", time: "เมื่อวาน", read: false },
  { id: "n4", type: "system", icon: "💡", title: "เคล็ดลับประจำสัปดาห์", body: "รู้หรือไม่? การเก็บหลักฐานหน้าจออย่างถูกต้องช่วยให้คดีเร็วขึ้นถึง 40%", time: "2 วันที่แล้ว", read: true },
  { id: "n5", type: "case", icon: "🎉", title: "วินิจฉัยเสร็จสิ้น", body: "AI วินิจฉัยปัญหา “แรงงาน” ของคุณเสร็จแล้ว ดูสรุปสิทธิได้เลย", time: "3 วันที่แล้ว", read: true },
  { id: "n6", type: "system", icon: "💎", title: "ทดลอง Action Pack ฟรี", body: "ปลดล็อกเอกสารไม่จำกัด 7 วัน — เริ่มได้เลยวันนี้", time: "5 วันที่แล้ว", read: true },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "unread", label: "ยังไม่อ่าน" },
  { id: "case", label: "เคส" },
  { id: "system", label: "ระบบ" },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const [load, setLoad] = useState<LoadState>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setLoad("ready"), 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "unread":
        return items.filter((n) => !n.read);
      case "case":
        return items.filter((n) => n.type === "case");
      case "system":
        return items.filter((n) => n.type === "system");
      default:
        return items;
    }
  }, [items, filter]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">การแจ้งเตือน 🔔</h2>
          <p className="text-sm text-muted">
            {unreadCount > 0 ? `คุณมี ${unreadCount} การแจ้งเตือนที่ยังไม่อ่าน` : "คุณอ่านครบทุกการแจ้งเตือนแล้ว 🎉"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            อ่านทั้งหมด
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div role="tablist" aria-label="กรองการแจ้งเตือน" className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f.id ? "bg-blue text-white" : "bg-white text-ink/80 hover:bg-blue-50",
            )}
          >
            {f.label}
            {f.id === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red px-1.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {load === "loading" && (
        <Card variant="base">
          <CardContent className="flex items-center justify-center py-16">
            <LoadingSpinner label="กำลังโหลดการแจ้งเตือน..." />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {load === "error" && (
        <Card variant="urgent">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-red/10 text-2xl">😕</div>
            <h3 className="text-base font-semibold text-ink">โหลดการแจ้งเตือนไม่สำเร็จ</h3>
            <Button variant="secondary" onClick={() => { setLoad("loading"); timer.current = setTimeout(() => setLoad("ready"), 500); }}>
              ลองใหม่
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {load === "ready" && filtered.length === 0 && (
        <EmptyState
          icon="🔕"
          title="ไม่มีการแจ้งเตือนในหมวดนี้"
          description="ทุกอย่างเรียบร้อย — ไม่มีเรื่องเร่งด่วนที่ต้องกังวลนะคะ"
        />
      )}

      {/* List */}
      {load === "ready" && filtered.length > 0 && (
        <ul className="flex flex-col gap-2">
          {filtered.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                  n.read ? "border-line bg-white" : "border-blue/30 bg-blue-50/40 hover:bg-blue-50",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl",
                    n.read ? "bg-canvas" : "bg-white",
                  )}
                  aria-hidden="true"
                >
                  {n.icon}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{n.title}</span>
                    {!n.read && <Badge variant="default">ใหม่</Badge>}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{n.body}</span>
                  <span className="text-xs text-muted/70">{n.time}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {load === "ready" && (
        <Link href="/profile" className="self-center text-xs font-medium text-blue hover:underline">
          ตั้งค่าการแจ้งเตือน →
        </Link>
      )}
    </div>
  );
}
