"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { USERS, USER_ROLE_LABEL } from "@/lib/admin";
import type { UserRole, UserStatus } from "@/lib/admin";
import { formatBaht, cn } from "@/lib/utils";

const ROLE_FILTERS: { id: UserRole | "all"; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "consumer", label: "ผู้ใช้งาน" },
  { id: "lawyer", label: "ทนายความ" },
  { id: "admin", label: "แอดมิน" },
];

const roleVariant: Record<UserRole, "info" | "success" | "warning"> = {
  consumer: "info",
  lawyer: "success",
  admin: "warning",
};

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  // Local copy so ban/unban toggling is stateful (mock until Supabase).
  const [users, setUsers] = useState(USERS.map((u) => ({ ...u })));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchR = roleFilter === "all" || u.role === roleFilter;
      return matchQ && matchR;
    });
  }, [users, query, roleFilter]);

  const toggleBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: (u.status === "banned" ? "active" : "banned") as UserStatus }
          : u,
      ),
    );
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">จัดการผู้ใช้งาน 👥</h2>
          <p className="text-sm text-muted">
            {users.length} บัญชี · {users.filter((u) => u.status === "banned").length} ถูกระงับ
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อหรืออีเมล..."
          className="w-full sm:max-w-xs"
          aria-label="ค้นหาผู้ใช้งาน"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setRoleFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              roleFilter === f.id
                ? "border-blue bg-blue text-white"
                : "border-line bg-white text-ink/80 hover:border-blue/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข" description="ลองปรับคำค้นหาหรือตัวกรองบทบาทใหม่" />
      ) : (
        <Card variant="base">
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-4 py-3 text-left font-semibold text-ink">ผู้ใช้งาน</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">บทบาท</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">สมัครเมื่อ</th>
                    <th className="px-4 py-3 text-right font-semibold text-ink">เคส</th>
                    <th className="px-4 py-3 text-right font-semibold text-ink">ใช้จ่าย</th>
                    <th className="px-4 py-3 text-left font-semibold text-ink">สถานะ</th>
                    <th className="px-4 py-3 text-right font-semibold text-ink">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id} className={i % 2 ? "bg-canvas/40" : ""}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{u.name}</p>
                            <p className="truncate text-xs text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleVariant[u.role]}>{USER_ROLE_LABEL[u.role]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{u.registered}</td>
                      <td className="px-4 py-3 text-right text-ink/85">{u.caseCount}</td>
                      <td className="px-4 py-3 text-right text-ink/85">{formatBaht(u.spend)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={u.status === "active" ? "success" : "danger"}>
                          {u.status === "active" ? "ใช้งานอยู่" : "ถูกระงับ"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== "admin" && (
                          <Button
                            variant={u.status === "banned" ? "secondary" : "danger"}
                            size="sm"
                            onClick={() => toggleBan(u.id)}
                          >
                            {u.status === "banned" ? "ปลดระงับ" : "ระงับ"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
