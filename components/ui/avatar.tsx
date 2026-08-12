import { cn, initials } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg";

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export interface AvatarProps {
  /** User's display name, used to derive initials */
  name?: string;
  /** Optional image URL */
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({
  name,
  src,
  alt,
  size = "md",
  className,
}: AvatarProps) {
  const fallback = name ? initials(name) : "ช";

  return (
    <span
      className={cn(
        "gradient-blue inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white",
        sizeStyles[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? "avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </span>
  );
}
