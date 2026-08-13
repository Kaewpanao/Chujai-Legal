/**
 * Chujai Legal — in-memory mock store.
 * Backs the case/document/payment routes when Supabase/Omise are not
 * configured. Module-level state is per-process (resets on cold start) and is
 * intended for local dev and demo only.
 */

export interface MockCase {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  status: "draft" | "active" | "closed";
  fearLevel: string;
  userId: string;
  answers: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface MockDocument {
  id: string;
  templateId: string;
  title: string;
  body: string;
  userId: string;
  createdAt: string;
}

export interface MockPayment {
  id: string;
  amount: number; // satang
  currency: string;
  status: "pending" | "successful" | "failed";
  packageId?: string;
  createdAt: string;
}

const now = () => new Date().toISOString();

const cases: MockCase[] = [
  {
    id: "case_demo_001",
    title: "ซื้อของออนไลน์แล้วไม่ได้ของ",
    categoryId: "online_fraud",
    categoryTitle: "ภัยออนไลน์",
    status: "active",
    fearLevel: "urgent",
    userId: "usr_demo",
    answers: { "โอนเงินแล้วหรือยัง": "โอนแล้ว", "จำนวนเงิน": "3,500 บาท" },
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
  },
  {
    id: "case_demo_002",
    title: "ถูกเลิกจ้างไม่เป็นธรรม",
    categoryId: "labour",
    categoryTitle: "แรงงาน",
    status: "draft",
    fearLevel: "concerned",
    userId: "usr_demo",
    answers: {},
    createdAt: "2026-08-08T09:30:00.000Z",
    updatedAt: "2026-08-08T09:30:00.000Z",
  },
];

const documents: MockDocument[] = [
  {
    id: "doc_demo_001",
    templateId: "demand-letter",
    title: "หนังสือทวงหนี้",
    body: "เรียน ... (หนังสือทวงหนี้ตัวอย่าง)",
    userId: "usr_demo",
    createdAt: "2026-08-09T14:00:00.000Z",
  },
];

const payments: MockPayment[] = [];

export function listCases(userId?: string): MockCase[] {
  if (!userId) return [...cases].reverse();
  return cases.filter((c) => c.userId === userId).reverse();
}

export function getCase(id: string): MockCase | undefined {
  return cases.find((c) => c.id === id);
}

export function createCase(data: {
  title: string;
  categoryId: string;
  categoryTitle: string;
  fearLevel: string;
  answers: Record<string, string>;
  userId: string;
}): MockCase {
  const record: MockCase = {
    id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status: "draft",
    createdAt: now(),
    updatedAt: now(),
    ...data,
  };
  cases.unshift(record);
  return record;
}

export function updateCase(
  id: string,
  patch: Partial<MockCase>,
): MockCase | undefined {
  const idx = cases.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  cases[idx] = { ...cases[idx], ...patch, updatedAt: now() };
  return cases[idx];
}

export function deleteCase(id: string): boolean {
  const idx = cases.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  cases.splice(idx, 1);
  return true;
}

export function listDocuments(userId?: string): MockDocument[] {
  if (!userId) return [...documents].reverse();
  return documents.filter((d) => d.userId === userId).reverse();
}

export function getDocument(id: string): MockDocument | undefined {
  return documents.find((d) => d.id === id);
}

export function createDocument(data: {
  templateId: string;
  title: string;
  body: string;
  userId: string;
}): MockDocument {
  const record: MockDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now(),
    ...data,
  };
  documents.unshift(record);
  return record;
}

export function listPayments(): MockPayment[] {
  return [...payments].reverse();
}

export function createPayment(data: {
  amount: number;
  currency: string;
  status: MockPayment["status"];
  packageId?: string;
}): MockPayment {
  const record: MockPayment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now(),
    ...data,
  };
  payments.unshift(record);
  return record;
}

export function updatePayment(
  id: string,
  patch: Partial<MockPayment>,
): MockPayment | undefined {
  const idx = payments.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  payments[idx] = { ...payments[idx], ...patch };
  return payments[idx];
}
