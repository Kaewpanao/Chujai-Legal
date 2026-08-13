/**
 * Chujai Legal — document merge engine.
 * Replaces {{field}} placeholders in a template body with user-supplied values.
 * Tracks unresolved fields so the UI can prompt for anything missing.
 */

import { getTemplateBody } from "./templates";
import { DOCUMENT_TEMPLATES } from "./categories";

export interface MergeResult {
  templateId: string;
  title: string;
  body: string;
  /** Fields that had no value supplied (left as blanks). */
  unresolved: string[];
  /** Standard disclaimer appended to every generated document. */
  disclaimer: string;
}

export const DOCUMENT_DISCLAIMER =
  "⚠️ เอกสารฉบับนี้เป็นร่างที่สร้างโดย AI (Chujai) เพื่อการศึกษาและเตรียมเอกสารเบื้องต้นเท่านั้น " +
  "ไม่ใช่คำปรึกษาทางกฎหมาย กรุณาตรวจสอบกับทนายความก่อนนำไปยื่นหรือใช้จริง";

const FIELD_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Replace placeholders with field values; leave missing fields blank. */
export function mergeFields(
  body: string,
  fields: Record<string, string>,
): { text: string; unresolved: string[] } {
  const unresolved: string[] = [];
  const text = body.replace(FIELD_PATTERN, (_match, key: string) => {
    const value = fields[key]?.trim();
    if (!value) {
      if (!unresolved.includes(key)) unresolved.push(key);
      return "______";
    }
    return value;
  });
  return { text, unresolved };
}

/** Generate a fully merged document from a template id + field values. */
export function generateDocument(
  templateId: string,
  fields: Record<string, string>,
): MergeResult | null {
  const template = getTemplateBody(templateId);
  if (!template) return null;

  const { text, unresolved } = mergeFields(template.body, fields);
  const meta = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);

  return {
    templateId,
    title: meta?.title ?? template.title,
    body: text,
    unresolved,
    disclaimer: DOCUMENT_DISCLAIMER,
  };
}

/** List all available template ids (for validation / dropdowns). */
export function listTemplateIds(): string[] {
  return DOCUMENT_TEMPLATES.map((t) => t.id);
}
