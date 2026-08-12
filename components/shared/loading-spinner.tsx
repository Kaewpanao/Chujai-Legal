import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label, className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-blue" />
      {label && <span className="text-sm text-muted">{label}</span>}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}
