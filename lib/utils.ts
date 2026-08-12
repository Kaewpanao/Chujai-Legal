/**
 * Chujai Legal — shared utilities.
 * No React dependency, safe to import anywhere.
 */

export type ClassValue = string | number | false | null | undefined;

/** Merge class names, filtering out falsy values. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a number with Thai thousands separators (e.g. 8,421). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("th-TH").format(value);
}

/** Format a value as Thai Baht (e.g. ฿2,990). */
export function formatBaht(value: number, opts?: { suffix?: boolean }): string {
  const formatted = new Intl.NumberFormat("th-TH").format(value);
  return opts?.suffix === false ? formatted : `฿${formatted}`;
}

/** Compact number for social proof (e.g. 12,000 → "12K", 1,200,000 → "1.2M"). */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

/** First character(s) for avatar initials — handles Thai names gracefully. */
export function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "ช";
  // Prefer the first character of the first two words (e.g. "สมชาย ใจดี" → "สจ")
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
  return trimmed.slice(0, 2);
}
