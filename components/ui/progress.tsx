import { cn } from "@/lib/utils";

export type ProgressColor = "blue" | "green" | "amber" | "red";

const colorStyles: Record<ProgressColor, string> = {
  blue: "gradient-blue",
  green: "bg-green",
  amber: "bg-amber",
  red: "bg-red",
};

export interface ProgressProps {
  /** Current value (0 – max) */
  value: number;
  /** Max value, defaults to 100 */
  max?: number;
  /** Optional label rendered above the bar */
  label?: string;
  /** Show numeric percentage label */
  showValue?: boolean;
  color?: ProgressColor;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  color = "blue",
  className,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="text-muted">{label}</span>}
          {showValue && (
            <span className="font-semibold text-ink">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            colorStyles[color],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
