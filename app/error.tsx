"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service when available.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="text-5xl" aria-hidden="true">
        😔
      </div>
      <h1 className="text-xl font-semibold text-ink">
        ขอโทษนะ เกิดข้อผิดพลาดบางอย่าง
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        เราเข้าใจว่ามันน่าหงุดหงิด — ลองอีกครั้ง แล้วเราจะช่วยคุณต่อ
      </p>
      <Button onClick={reset}>ลองอีกครั้ง</Button>
    </div>
  );
}
