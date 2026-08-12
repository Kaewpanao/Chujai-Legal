import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Warm emoji icon */
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon = "🫧",
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-2xl">
        <span aria-hidden="true">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-1">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
