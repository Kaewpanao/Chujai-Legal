import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LegalDisclaimer } from "@/components/shared/legal-disclaimer";
import {
  LEGAL_CATEGORIES,
  TOTAL_CATEGORIES,
  TOTAL_CASES_HELPED,
} from "@/lib/legal/categories";
import { PACKAGE_TIERS } from "@/lib/packages/definitions";
import { cn, formatBaht, formatNumber } from "@/lib/utils";

const STATS = [
  { value: `${formatNumber(TOTAL_CASES_HELPED)}+`, label: "เคสที่ช่วยแล้ว" },
  { value: "8,420+", label: "คนได้รับความช่วยเหลือ" },
  { value: "4.8/5", label: "คะแนนจากผู้ใช้" },
  { value: "98%", label: "ประหยัดกว่าจ้างทนาย" },
];

const FEATURES = [
  {
    icon: "🤖",
    title: "AI วินิจฉัยปัญหา",
    description: "เล่าเรื่องให้ฟัง — AI ระบุหมวดกฎหมายและสิทธิของคุณได้ใน 5 นาที",
  },
  {
    icon: "🧭",
    title: "Concierge 8 ขั้นตอน",
    description: "เดินตามทีละขั้น ตั้งแต่เข้าใจปัญหา รวบรวมหลักฐาน ยื่นเอกสาร จนติดตามผล",
  },
  {
    icon: "📄",
    title: "สร้างเอกสาร",
    description: "คำร้อง หนังสือทวงถาม สัญญา พร้อมใช้ ด้วยภาษาที่เข้าใจง่าย",
  },
  {
    icon: "💰",
    title: "คำนวณภาษี",
    description: "วางแผนภาษีให้ประหยัดที่สุด พร้อม checklist ยื่นภาษีครบทุกข้อ",
  },
  {
    icon: "👨‍⚖️",
    title: "หาทนายเฉพาะทาง",
    description: "ทนายผ่านการยืนยันตัวตน เลือกตามหมวดและพื้นที่ใกล้บ้านคุณ",
  },
  {
    icon: "🛡️",
    title: "ปลอดภัยและเป็นส่วนตัว",
    description: "ข้อมูลเข้ารหัสตามมาตรฐานสากล และปฏิบัติตามกฎหมาย PDPA",
  },
];

const STEPS = [
  {
    icon: "💬",
    title: "เล่าเรื่องของคุณ",
    description: "พิมพ์ปัญหาด้วยภาษาของคุณเอง ไม่ต้องรู้ศัพท์กฎหมาย",
  },
  {
    icon: "🔍",
    title: "AI วิเคราะห์สิทธิ",
    description: "สรุปให้เข้าใจง่าย พร้อมบอกสิทธิและทางเลือกที่คุณมี",
  },
  {
    icon: "💪",
    title: "ลงมือทำทีละขั้น",
    description: "เดินตามขั้นตอน ทำเองได้ หรือปรึกษาทนายเมื่อต้องการ",
  },
];

const TESTIMONIALS = [
  {
    name: "คุณวิภา",
    location: "กรุงเทพฯ",
    quote: "ไม่เคยคิดว่าจะจัดการเรื่องกฎหมายเองได้ ขอบคุณมากค่ะ",
  },
  {
    name: "คุณเอก",
    location: "เชียงใหม่",
    quote: "ถูกโกงออนไลน์ เครียดมาก ชูใจช่วยจนได้เงินคืน",
  },
  {
    name: "คุณเมย์",
    location: "ขอนแก่น",
    quote: "แค่ 299 บาท ประหยัดค่าทนายไปหลายหมื่น",
  },
];

export default function MarketingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-gradient px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
            🫶 ชูใจ — เพื่อนคู่คิดด้านกฎหมายของคุณ
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
            เรื่องกฎหมายไม่ต้องเป็นเรื่องยากอีกต่อไป
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/85">
            พิมพ์ปัญหาด้วยภาษาของคุณ — ชูใจช่วยสรุปให้เข้าใจง่าย
            พร้อมบอกสิทธิและทุกขั้นตอนที่คุณทำเองได้
          </p>

          <form
            action="/search"
            className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-2xl bg-white p-2 shadow-lg"
          >
            <input
              type="text"
              name="q"
              placeholder="เช่น ถูกเลิกจ้างโดยไม่แจ้งล่วงหน้า ทำอย่างไร?"
              className="h-11 min-w-0 flex-1 rounded-xl border-0 bg-transparent px-4 text-ink outline-none placeholder:text-muted/70"
            />
            <Button type="submit" className="shrink-0">
              ค้นหา
            </Button>
          </form>
          <p className="mt-4 text-sm text-white/60">
            😰 กำลังเครียดเรื่องกฎหมายอยู่? บอกเรา เราช่วยได้
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <Card key={stat.label} className="p-6 text-center">
              <div className="text-2xl font-bold text-blue md:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section id="categories" className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="mb-8 text-center">
          <Badge icon="📚" variant="info">
            {TOTAL_CATEGORIES} หมวดกฎหมาย
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold text-ink md:text-3xl">
            เริ่มจากเรื่องที่คุณกำลังเจอ
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            เราเข้าใจว่าเรื่องกฎหมายน่ากลัว — แต่ละหมวดมีขั้นตอนที่คุณทำเองได้
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {LEGAL_CATEGORIES.map((category) => (
            <Link key={category.id} href={`/concierge/new?category=${category.id}`}>
              <Card
                variant="hover"
                className="flex h-full flex-col gap-1 p-5 text-center"
              >
                <div
                  className="mx-auto grid h-12 w-12 place-items-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${category.accent}1a` }}
                >
                  <span aria-hidden="true">{category.icon}</span>
                </div>
                <div className="mt-2 font-semibold text-ink">{category.title}</div>
                <p className="text-xs leading-relaxed text-muted">{category.hint}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-ink md:text-3xl">
              ทุกอย่างที่คุณต้องใช้จัดการเรื่องกฎหมาย
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted">
              ออกแบบให้เข้าใจง่าย ใช้ได้จริง ไม่ต้องจ้างทนายทุกเรื่อง
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} variant="hover" className="p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-2xl">
                  <span aria-hidden="true">{feature.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-ink md:text-3xl">
            ง่ายแค่ 3 ขั้นตอน
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            ไม่ต้องรู้กฎหมายมาก่อน — แค่เริ่มจากเรื่องที่คุณเจอ
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title} className="relative p-6">
              <span className="absolute right-5 top-4 text-4xl font-bold text-blue-50">
                {index + 1}
              </span>
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-blue-soft text-2xl">
                <span aria-hidden="true">{step.icon}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-ink md:text-3xl">
              เลือกแพ็กเกจที่เหมาะกับคุณ
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted">
              เริ่มฟรีได้เลย — อัปเกรดเมื่อพร้อม ถูกกว่าจ้างทนายถึง 98%
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGE_TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={cn(
                  "flex flex-col p-6",
                  tier.highlight && "border-blue/50 shadow-lg shadow-blue/10",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    {tier.emoji}
                  </span>
                  <h3 className="text-lg font-semibold text-ink">{tier.name}</h3>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-ink">
                    {tier.price === 0 ? "฿0" : formatBaht(tier.price)}
                  </span>
                  {tier.priceSuffix && (
                    <span className="text-sm text-muted">{tier.priceSuffix}</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{tier.tagline}</p>

                <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 shrink-0",
                          feature.included ? "text-green" : "text-muted/50",
                        )}
                        aria-hidden="true"
                      >
                        {feature.included ? "✓" : "✗"}
                      </span>
                      <span
                        className={cn(
                          feature.included ? "text-ink/90" : "text-muted/60",
                        )}
                      >
                        {feature.label}
                        {feature.note && (
                          <span className="text-muted/70"> ({feature.note})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth/register" className="mt-6">
                  <Button
                    variant={tier.highlight ? "upgrade" : tier.id === "free" ? "secondary" : "primary"}
                    className="w-full"
                  >
                    {tier.ctaLabel}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-ink md:text-3xl">
            คนไทยจัดการเรื่องกฎหมายเองได้จริง
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            เราช่วยคนมาแล้วกว่า {formatNumber(TOTAL_CASES_HELPED)} เคส
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} className="p-6">
              <div className="flex items-center gap-2 text-amber" aria-hidden="true">
                {"⭐".repeat(5)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink">
                “{testimonial.quote}”
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={testimonial.name} size="sm" />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-ink">
                    {testimonial.name}
                  </span>
                  <span className="text-xs text-muted">{testimonial.location}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <Card className="hero-gradient border-0 p-8 text-center text-white md:p-12">
          <h2 className="text-2xl font-semibold md:text-3xl">
            พร้อมเริ่มต้นหรือยัง?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">
            เราเข้าใจว่าการเริ่มต้นน่ากลัว แต่คุณไม่ได้อยู่คนเดียว —
            เริ่มจากขั้นแรกง่ายๆ ไปด้วยกัน
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-dark hover:bg-white/90">
                เริ่มใช้งานฟรี
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                ดูวิธีใช้งาน
              </Button>
            </Link>
          </div>
        </Card>

        <div className="mx-auto mt-8 max-w-3xl">
          <LegalDisclaimer />
        </div>
      </section>
    </>
  );
}
