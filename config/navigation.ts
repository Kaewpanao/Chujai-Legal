/**
 * Chujai Legal — navigation structure.
 * Central nav definitions shared by Sidebar, Topbar, and BottomNav.
 * Source: Master Design §A.4 (Complete Route Map).
 */

export interface NavItem {
  label: string;
  href: string;
  /** Warm emoji icon */
  icon?: string;
  /** Optional short description (tooltip / aria) */
  description?: string;
  /** Optional badge text, e.g. unread count or "ใหม่" */
  badge?: string;
}

export const MARKETING_NAV: NavItem[] = [
  { label: "หน้าหลัก", href: "/", icon: "🏠" },
  { label: "วิธีใช้งาน", href: "/how-it-works", icon: "🧭" },
  { label: "หมวดกฎหมาย", href: "/#categories", icon: "📚" },
  { label: "ราคา", href: "/pricing", icon: "💰" },
  { label: "ช่วยเหลือ", href: "/help", icon: "💬" },
];

export const CONSUMER_NAV: NavItem[] = [
  { label: "หน้าหลัก", href: "/", icon: "🏠" },
  { label: "เคส", href: "/concierge", icon: "📋" },
  { label: "AI", href: "/search", icon: "🤖", description: "AI ค้นหากฎหมาย" },
  { label: "เอกสาร", href: "/documents", icon: "📄" },
  { label: "Concierge", href: "/concierge/new", icon: "🧭" },
  { label: "โปรไฟล์", href: "/profile", icon: "👤" },
];

export const LAWYER_NAV: NavItem[] = [
  { label: "แดชบอร์ด", href: "/", icon: "📊" },
  { label: "เคส", href: "/cases", icon: "📋" },
  { label: "ลูกความ", href: "/clients", icon: "👥" },
  { label: "การเงิน", href: "/billing", icon: "💰" },
  { label: "เอกสาร", href: "/documents", icon: "📄" },
  { label: "วิเคราะห์", href: "/analytics", icon: "📈" },
  { label: "โปรไฟล์", href: "/profile", icon: "👤" },
  { label: "ตั้งค่า", href: "/settings", icon: "⚙️" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "ภาพรวม", href: "/", icon: "📊" },
  { label: "ผู้ใช้งาน", href: "/users", icon: "👥" },
  { label: "เคสทั้งหมด", href: "/cases", icon: "📋" },
  { label: "ทนายความ", href: "/lawyers", icon: "⚖️" },
  { label: "รายได้", href: "/revenue", icon: "💰" },
  { label: "เนื้อหา", href: "/content", icon: "📝" },
  { label: "ตั้งค่า", href: "/settings", icon: "⚙️" },
];
