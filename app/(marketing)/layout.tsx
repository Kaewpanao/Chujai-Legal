import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import { MARKETING_NAV } from "@/config/navigation";

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "แพลตฟอร์ม",
    links: [
      { label: "วิธีใช้งาน", href: "/how-it-works" },
      { label: "หมวดกฎหมาย", href: "/#categories" },
      { label: "ราคา", href: "/pricing" },
    ],
  },
  {
    title: "บริษัท",
    links: [
      { label: "เกี่ยวกับเรา", href: "/about" },
      { label: "ช่วยเหลือ", href: "/help" },
      { label: "ติดต่อเรา", href: "/help" },
    ],
  },
  {
    title: "กฎหมาย",
    links: [
      { label: "ข้อกำหนดการใช้งาน", href: "/terms" },
      { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
      { label: "PDPA", href: "/privacy" },
    ],
  },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="brand-mark">ช</span>
            <span className="flex flex-col leading-tight">
              <span className="font-semibold text-ink">ชูใจ ลีกัล</span>
              <span className="hidden text-[11px] text-muted sm:block">
                Chujai Legal
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {MARKETING_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-canvas hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">เริ่มใช้งานฟรี</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <span className="brand-mark">ช</span>
                <span className="font-semibold text-ink">ชูใจ ลีกัล</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                เรื่องกฎหมายไม่ต้องเป็นเรื่องยากอีกต่อไป — เราเข้าใจ และเราช่วยได้
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
              {FOOTER_LINKS.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-3 font-semibold text-ink">{col.title}</h4>
                  <ul className="flex flex-col gap-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-muted transition-colors hover:text-blue"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
            <LegalDisclaimer />
            <p className="text-xs text-muted">
              © 2026 ชูใจ ลีกัล (Chujai Legal) — สงวนลิขสิทธิ์
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
