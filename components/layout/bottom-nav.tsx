"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

export interface BottomNavProps {
  items: NavItem[];
  /** Max items to render (mobile bottom navs are cramped) */
  maxItems?: number;
  className?: string;
}

export function BottomNav({ items, maxItems = 5, className }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact || href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden",
        className,
      )}
      aria-label="เมนูหลัก (มือถือ)"
    >
      {items.slice(0, maxItems).map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              active ? "text-blue" : "text-muted",
            )}
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
