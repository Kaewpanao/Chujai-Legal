import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-blue-50 text-blue",
  success: "bg-green/10 text-green",
  warning: "bg-amber/10 text-amber",
  danger: "bg-red/10 text-red",
  neutral: "bg-gray-100 text-muted",
  info: "bg-blue-50 text-blue-dark",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Optional emoji icon shown before the label */
  icon?: string;
}

export function Badge({
  variant = "default",
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className="text-[0.95em] leading-none">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
