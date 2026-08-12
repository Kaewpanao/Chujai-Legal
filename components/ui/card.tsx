import { cn } from "@/lib/utils";

export type CardVariant = "base" | "hover" | "urgent" | "free" | "locked";

const cardVariants: Record<CardVariant, string> = {
  base: "bg-white border border-line shadow-sm",
  hover:
    "bg-white border border-line shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-blue/40",
  urgent: "bg-red/5 border border-red/25 border-l-4 border-l-red",
  free: "bg-blue-50/60 border border-blue/20 border-l-4 border-l-blue",
  locked: "bg-gray-50 border border-line opacity-80",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ variant = "base", className, ...props }: CardProps) {
  return (
    <div className={cn("rounded-2xl", cardVariants[variant], className)} {...props} />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-3", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-ink", className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted leading-relaxed", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-1", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2 p-5 pt-2", className)} {...props} />
  );
}
