"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

export interface SidebarBrand {
  label: string;
  sublabel?: string;
}

export interface SidebarProps {
  items: NavItem[];
  brand?: SidebarBrand;
  /** Optional role badge shown next to the brand, e.g. "ทนาย" / "Admin" */
  badge?: string;
  /** Optional footer slot (e.g. user card / logout) */
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({
  items,
  brand,
  badge,
  footer,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact || href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-line bg-white",
        className,
      )}
      aria-label="เมนูหลัก"
    >
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <span className="brand-mark shrink-0">ช</span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-semibold text-ink">
            {brand?.label ?? "ชูใจ ลีกัล"}
          </span>
          {brand?.sublabel && (
            <span className="truncate text-xs text-muted">{brand.sublabel}</span>
          )}
        </div>
        {badge && (
          <Badge variant="info" className="ml-auto">
            {badge}
          </Badge>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={item.description}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue"
                      : "text-ink/80 hover:bg-canvas hover:text-ink",
                  )}
                >
                  {item.icon && (
                    <span className="text-base leading-none" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-blue px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {footer && <div className="border-t border-line p-4">{footer}</div>}
    </aside>
  );
}
