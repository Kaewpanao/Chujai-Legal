import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TopbarProps {
  title?: string;
  subtitle?: string;
  /** Unread notification count (0 hides the badge) */
  notifications?: number;
  userName?: string;
  userRole?: string;
  /** Extra actions rendered before the notification bell */
  right?: React.ReactNode;
  className?: string;
}

export function Topbar({
  title,
  subtitle,
  notifications = 0,
  userName = "คุณ",
  userRole,
  right,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center gap-3 border-b border-line bg-white px-4 md:px-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col leading-tight">
        {title && (
          <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
        )}
        {subtitle && (
          <span className="truncate text-xs text-muted">{subtitle}</span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {right}

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-lg transition-colors hover:bg-canvas"
          aria-label="การแจ้งเตือน"
        >
          <span aria-hidden="true">🔔</span>
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 text-[10px] font-semibold leading-none text-white">
              {notifications > 99 ? "99+" : notifications}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <Avatar name={userName} size="md" />
          <div className="hidden flex-col leading-tight md:flex">
            <span className="text-sm font-medium text-ink">{userName}</span>
            {userRole && <span className="text-xs text-muted">{userRole}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}
