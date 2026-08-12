import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="text-6xl" aria-hidden="true">
        🔍
      </div>
      <h1 className="text-2xl font-semibold text-ink">ไม่พบหน้าที่คุณหา</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        หน้าอาจถูกย้ายหรือไม่มีอยู่ — กลับไปหน้าแรกแล้วเริ่มใหม่ได้เลย
      </p>
      <Link href="/">
        <Button>กลับหน้าหลัก</Button>
      </Link>
    </div>
  );
}
