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
  /**
   * When true, the item is only "active" on an exact path match.
   * Use for group roots (e.g. /lawyer) that are also a prefix of child routes.
   */
  exact?: boolean;
}

export const MARKETING_NAV: NavItem[] = [
  { label: "หน้าหลัก", href: "/", icon: "🏠", exact: true },
  { label: "วิธีใช้งาน", href: "/how-it-works", icon: "🧭" },
  { label: "หมวดกฎหมาย", href: "/#categories", icon: "📚" },
  { label: "ราคา", href: "/pricing", icon: "💰" },
  { label: "ช่วยเหลือ", href: "/help", icon: "💬" },
];

export const CONSUMER_NAV: NavItem[] = [
  { label: "หน้าหลัก", href: "/home", icon: "🏠", exact: true },
  { label: "วินิจฉัย", href: "/diagnosis", icon: "🩺", description: "วินิจฉัยปัญหา 8 ขั้นตอน" },
  { label: "ค้นหา AI", href: "/search", icon: "🤖", description: "AI ค้นหากฎหมาย" },
  { label: "Concierge", href: "/concierge", icon: "🧭", description: "นำทางทีละขั้นจนจบ" },
  { label: "เอกสาร", href: "/documents", icon: "📄" },
  { label: "ภาษี", href: "/tax", icon: "💸" },
  { label: "ทนายความ", href: "/lawyers", icon: "⚖️" },
  { label: "ราคา", href: "/pricing", icon: "💰" },
  { label: "แจ้งเตือน", href: "/notifications", icon: "🔔" },
  { label: "โปรไฟล์", href: "/profile", icon: "👤" },
];

export const LAWYER_NAV: NavItem[] = [
  { label: "แดชบอร์ด", href: "/lawyer", icon: "📊", exact: true },
  { label: "เคส", href: "/lawyer/cases", icon: "📋" },
  { label: "ลูกความ", href: "/lawyer/clients", icon: "👥" },
  { label: "การเงิน", href: "/lawyer/billing", icon: "💰" },
  { label: "โปรไฟล์", href: "/lawyer/profile", icon: "👤" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "ภาพรวม", href: "/admin", icon: "📊", exact: true },
  { label: "ผู้ใช้งาน", href: "/admin/users", icon: "👥" },
  { label: "เคสทั้งหมด", href: "/admin/cases", icon: "📋" },
  { label: "ทนายความ", href: "/admin/lawyers", icon: "⚖️" },
  { label: "รายได้", href: "/admin/revenue", icon: "💰" },
  { label: "เนื้อหา", href: "/admin/content", icon: "📝" },
  { label: "ตั้งค่า", href: "/admin/settings", icon: "⚙️" },
];
