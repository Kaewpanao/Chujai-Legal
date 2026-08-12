import { cn } from "@/lib/utils";

export interface LegalDisclaimerProps {
  className?: string;
}

/**
 * Warm-toned legal disclaimer shown on AI-generated content.
 * Source: Master Design §B.1 (ALWAYS include disclaimer).
 */
export function LegalDisclaimer({ className }: LegalDisclaimerProps) {
  return (
    <p
      className={cn(
        "rounded-xl bg-blue-50/60 px-4 py-3 text-xs leading-relaxed text-ink/70",
        className,
      )}
    >
      <span className="font-semibold text-blue-dark">🛡️ ข้อความสำคัญ:</span>{" "}
      ข้อมูลจากชูใจเป็นข้อมูลกฎหมายทั่วไปเพื่อการศึกษาเท่านั้น ไม่ใช่คำปรึกษาทางกฎหมายเฉพาะราย
      หากเป็นเรื่องเร่งด่วนหรือซับซ้อน เราขอแนะนำให้ปรึกษาทนายความผู้เชี่ยวชาญ
    </p>
  );
}
