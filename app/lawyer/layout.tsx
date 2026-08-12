import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LAWYER_NAV } from "@/config/navigation";

export default function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        items={LAWYER_NAV}
        brand={{ label: "ชูใจ ลีกัล", sublabel: "สำหรับทนายความ" }}
        badge="ทนาย"
        footer={
          <p className="text-xs leading-relaxed text-muted">
            ⚖️ ช่วยลูกความของคุณได้อย่างมีประสิทธิภาพ
          </p>
        }
        className="sticky top-0 hidden h-screen md:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="แอปสำหรับทนายความ"
          subtitle="จัดการเคส ลูกความ และการเงินของคุณ"
          notifications={5}
          userName="ทนายสมหมาย"
          userRole="ทนายความที่ผ่านการยืนยัน"
        />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      <BottomNav items={LAWYER_NAV} />
    </div>
  );
}
