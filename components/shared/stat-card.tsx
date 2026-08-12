import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** Warm emoji icon */
  icon: string;
  label: string;
  value: string;
  /** Optional delta/context line, e.g. "+12% จากเดือนก่อน" */
  delta?: string;
  /** Color semantics for the delta line */
  tone?: "up" | "down" | "neutral";
  className?: string;
}

/**
 * Reusable KPI stat card used on the lawyer dashboard and admin overview.
 * Server-safe (no client hooks).
 */
export function StatCard({
  icon,
  label,
  value,
  delta,
  tone = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{label}</p>
          <p className="truncate text-xl font-semibold leading-tight text-ink">
            {value}
          </p>
        </div>
      </div>
      {delta && (
        <p
          className={cn(
            "mt-2.5 text-xs font-medium",
            tone === "up" && "text-green",
            tone === "down" && "text-red",
            tone === "neutral" && "text-muted",
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
