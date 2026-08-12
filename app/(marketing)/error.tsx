"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="text-5xl" aria-hidden="true">
        🌧️
      </div>
      <h1 className="text-xl font-semibold text-ink">
        ขอโทษนะ หน้านี้โหลดไม่สำเร็จ
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        ไม่เป็นไรนะ เราอยู่ตรงนี้เพื่อช่วยคุณ — ลองโหลดใหม่อีกครั้ง
      </p>
      <Button onClick={reset}>โหลดใหม่</Button>
    </div>
  );
}
