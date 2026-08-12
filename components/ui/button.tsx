import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "upgrade"
  | "outline";

export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 select-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue text-white shadow-md shadow-blue/20 hover:bg-blue-dark hover:-translate-y-px active:scale-[0.98]",
  secondary:
    "border border-line bg-white text-ink hover:border-blue hover:text-blue active:scale-[0.98]",
  ghost: "text-ink hover:bg-blue-50 hover:text-blue",
  danger:
    "bg-red text-white shadow-md shadow-red/20 hover:opacity-90 active:scale-[0.98]",
  upgrade:
    "gradient-blue text-white shadow-lg shadow-blue/30 hover:-translate-y-px active:scale-[0.98]",
  outline: "border border-blue text-blue hover:bg-blue-50 active:scale-[0.98]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
