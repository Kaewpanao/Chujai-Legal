import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LEGAL_CATEGORIES,
  TOTAL_CASES_HELPED,
} from "@/lib/legal/categories";
import { FEAR_LEVELS } from "@/lib/legal/fear-calibration";
import { formatCompactNumber, formatNumber } from "@/lib/utils";

// Social proof signals (source: Master Design §F.1 social proof / §C.1 counts)
const SOCIAL_PROOF = [
  { label: "เคสที่ช่วยแล้ว", value: formatCompactNumber(TOTAL_CASES_HELPED), icon: "🫶" },
  { label: "ผู้ใช้งาน", value: "12,000+", icon: "👥" },
  { label: "ความพึงพอใจ", value: "4.9/5", icon: "⭐" },
  { label: "ประหยัดค่าทนาย", value: "฿18M+", icon: "💰" },
];

// Sample active cases (placeholder until Supabase-backed; see Master Design §D)
const ACTIVE_CASES = [
  { id: "c-1042", title: "ถูกโกงซื้อของออนไลน์", category: "ภัยออนไลน์", status: "กำลังดำเนินการ", statusVariant: "info" as const, updated: "อัปเดต 2 ชั่วโมงที่แล้ว" },
  { id: "c-1038", title: "ถูกเลิกจ้างไม่เป็นธรรม", category: "แรงงาน", status: "รอเอกสาร", statusVariant: "warning" as const, updated: "อัปเดตเมื่อวาน" },
  { id: "c-1031", title: "เคลมประกันรถถูกปฏิเสธ", category: "ประกันภัย", status: "ปรึกษาทนาย", statusVariant: "success" as const, updated: "อัปเดต 3 วันที่แล้ว" },
];

export default function ConsumerHomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Welcome + fear calibration entry */}
      <section className="hero-gradient relative overflow-hidden rounded-3xl p-6 text-white md:p-8">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-3 bg-white/15 text-white" icon="🫶">
            ชูใจอยู่ตรงนี้เสมอ
          </Badge>
          <h1 className="text-2xl font-semibold leading-snug md:text-3xl">
            สวัสดีคุณสมชาย มีอะไรให้ชูใจช่วยวันนี้?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            เล่าเรื่องของคุณให้เราฟังได้เลย — เราจะช่วยวิเคราะห์สิทธิและบอกทุกขั้นตอน
            จนคุณทำเองได้อย่างมั่นใจ ไม่ต้องกังวลเรื่องศัพท์กฎหมายยาก ๆ
          </p>

          {/* Search box → routes to /search */}
          <form action="/search" method="get" className="mt-5 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="home-search" className="sr-only">
              ค้นหาปัญหากฎหมาย
            </label>
            <Input
              id="home-search"
              name="q"
              placeholder="ลองพิมพ์ เช่น “ถูกโกงโอนเงิน” “ถูกเลิกจ้าง”..."
              className="h-12 flex-1 bg-white text-ink"
            />
            <Button type="submit" size="lg" className="h-12">
              🔍 ค้นหา
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/diagnosis">
              <Button variant="secondary" size="sm" className="bg-white/95 text-blue">
                {FEAR_LEVELS[0].emoji} เริ่มวินิจฉัยปัญหา
              </Button>
            </Link>
            <Link href="/concierge">
              <Button variant="secondary" size="sm" className="bg-white/95 text-blue">
                🧭 ใช้ Concierge นำทางทีละขั้น
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof stats */}
      <section aria-label="สถิติความน่าเชื่อถือ" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SOCIAL_PROOF.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-2xl" aria-hidden="true">{s.icon}</div>
            <div className="mt-1 text-xl font-semibold text-ink">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </Card>
        ))}
      </section>

      {/* 12 categories grid */}
      <section aria-labelledby="categories-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="categories-heading" className="text-lg font-semibold text-ink">
              หมวดกฎหมายที่เราช่วยได้
            </h2>
            <p className="text-sm text-muted">เลือกหัวข้อที่ใกล้เคียงที่สุด แล้วเริ่มวินิจฉัยได้เลย</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {LEGAL_CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/diagnosis?category=${cat.id}`} className="group">
              <Card variant="hover" className="h-full">
                <CardContent className="flex h-full flex-col gap-1.5">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-xl"
                    style={{ backgroundColor: `${cat.accent}1a` }}
                    aria-hidden="true"
                  >
                    {cat.icon}
                  </span>
                  <h3 className="text-sm font-semibold text-ink group-hover:text-blue">
                    {cat.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted">{cat.hint}</p>
                  <span className="mt-auto pt-1 text-xs font-medium text-blue">
                    {formatNumber(cat.socialProof)} เคส
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Active cases preview */}
      <section aria-labelledby="cases-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="cases-heading" className="text-lg font-semibold text-ink">
              เคสที่กำลังดูแล
            </h2>
            <p className="text-sm text-muted">ติดตามความคืบหน้าของคุณได้ที่นี่</p>
          </div>
          <Link href="/concierge" className="text-sm font-medium text-blue hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {ACTIVE_CASES.map((c) => (
            <Card key={c.id} variant="hover" className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted">#{c.id}</span>
                  <Badge variant={c.statusVariant}>{c.status}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-ink">{c.title}</h3>
                <p className="text-xs text-muted">{c.category}</p>
                <p className="mt-auto pt-1 text-xs text-muted/70">{c.updated}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
