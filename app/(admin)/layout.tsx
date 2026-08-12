import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ADMIN_NAV } from "@/config/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        items={ADMIN_NAV}
        brand={{ label: "ชูใจ ลีกัล", sublabel: "แอดมิน" }}
        badge="Admin"
        footer={
          <p className="text-xs leading-relaxed text-muted">
            🛡️ แผงควบคุมภายใน — ผู้ดูแลระบบเท่านั้น
          </p>
        }
        className="sticky top-0 hidden h-screen md:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="ภาพรวมแพลตฟอร์ม"
          subtitle="ตัวชี้วัดและสถานะระบบล่าสุด"
          notifications={12}
          userName="ผู้ดูแลระบบ"
          userRole="Administrator"
        />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      <BottomNav items={ADMIN_NAV} />
    </div>
  );
}
