import { cn } from "@/lib/utils";

export type InputVariant = "base" | "error" | "success";

const inputVariants: Record<InputVariant, string> = {
  base: "border-line focus:border-blue focus:ring-2 focus:ring-blue/20",
  error: "border-red focus:border-red focus:ring-2 focus:ring-red/20",
  success: "border-green focus:border-green focus:ring-2 focus:ring-green/20",
};

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  /** Helper/error message shown under the input */
  error?: string;
}

export function Input({
  variant = "base",
  error,
  className,
  ...props
}: InputProps) {
  const input = (
    <input
      className={cn(
        "h-11 w-full rounded-xl border bg-white px-4 text-ink placeholder:text-muted/70 transition-colors outline-none",
        inputVariants[error ? "error" : variant],
        className,
      )}
      aria-invalid={!!error}
      {...props}
    />
  );

  if (!error) return input;

  return (
    <div className="w-full">
      {input}
      <p className="mt-1.5 text-sm text-red" role="alert">
        {error}
      </p>
    </div>
  );
}
