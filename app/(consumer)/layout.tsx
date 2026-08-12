import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CONSUMER_NAV } from "@/config/navigation";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        items={CONSUMER_NAV}
        brand={{ label: "ชูใจ ลีกัล", sublabel: "พื้นที่ของคุณ" }}
        footer={
          <p className="text-xs leading-relaxed text-muted">
            🫶 เราเข้าใจ และเราอยู่ตรงนี้เพื่อช่วยคุณ
          </p>
        }
        className="sticky top-0 hidden h-screen md:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="หน้าหลัก"
          subtitle="มีอะไรให้ชูใจช่วยวันนี้?"
          notifications={3}
          userName="คุณสมชาย"
          userRole="แพ็กเกจ: ฟรี"
        />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      <BottomNav items={CONSUMER_NAV} />
    </div>
  );
}
