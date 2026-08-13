/**
 * Chujai Legal — runtime guardrail checker.
 * Scans AI-generated text for violations of the safety guardrails defined in
 * `lib/legal/guardrails.ts`. Used to gate every AI response before it reaches
 * the user. High-signal must-never violations trigger a hard block.
 */

import { SAFETY_GUARDRAILS, type GuardrailSeverity } from "./guardrails";

export interface GuardrailViolation {
  guardrailId: string;
  severity: GuardrailSeverity;
  rule: string;
  /** The matched phrase that triggered the violation. */
  matched: string;
}

export interface GuardrailCheckResult {
  violations: GuardrailViolation[];
  /** True when a must-never rule was breached (response should be blocked). */
  blocked: boolean;
}

/**
 * Regex patterns mapped to guardrail ids. Each entry detects a concrete
 * must-never / must-always breach in generated text.
 */
const PATTERNS: { id: string; pattern: RegExp }[] = [
  {
    id: "no-outcome-prediction",
    pattern: /(ชนะ|แพ้|ได้เงิน|ได้ทรัพย์)(แน่นอน|ชัวร์|100%|100 เปอร์เซ็นต์|\s*\d{1,3}\s*%)/i,
  },
  {
    id: "no-false-promise",
    // Match promise phrases ("รับประกันว่า…") only — NOT the noun "ผู้รับประกันภัย"
    // / "บริษัทรับประกันภัย" / "สัญญาประกันภัย" which appear in every insurance answer.
    // "รับรองว่า" alone is too broad ("กฎหมายรับรองว่าคุณมีสิทธิ" is a legal fact,
    // not a promise) — so only match the outcome-promise form.
    pattern: /(รับประกันว่า|รับประกันผล|รับประกันความสำเร็จ|รับประกันได้|การันตี|การันตีว่า|รับรองว่าชนะ|ชนะ\s*100)/i,
  },
  {
    id: "no-legal-advice",
    pattern: /(คุณควรฟ้อง|คุณต้องฟ้อง|คุณควรยื่นฟ้อง|คุณต้องยื่นฟ้อง|แนะนำให้ฟ้อง|ตัดสินใจฟ้อง)/i,
  },
  {
    id: "no-lawyer-ranking",
    pattern: /(ทนายที่ดีที่สุด|ทนายอันดับหนึ่ง|แนะนำทนายคนนี้|ทนายคนนี้เก่งที่สุด)/i,
  },
  {
    id: "no-fabricated-citations",
    // Legit Thai section numbers are 1-4 digits (e.g. มาตรา 1474, 1516); only
    // flag obvious fabrications: the fake "999", "000…", or 5+ digit numbers.
    pattern: /(มาตรา\s*999\b|มาตรา\s*0+\b|มาตรา\s*\d{5,})/i,
  },
];

export function checkGuardrails(text: string): GuardrailCheckResult {
  const violations: GuardrailViolation[] = [];
  const haystack = text ?? "";

  for (const { id, pattern } of PATTERNS) {
    const match = haystack.match(pattern);
    if (match) {
      const guardrail = SAFETY_GUARDRAILS.find((g) => g.id === id);
      violations.push({
        guardrailId: id,
        severity: guardrail?.severity ?? "must-never",
        rule: guardrail?.rule ?? id,
        matched: match[0],
      });
    }
  }

  const blocked = violations.some((v) => v.severity === "must-never");

  return { violations, blocked };
}

/** Guardrail ids, in severity order, for serializing into API responses. */
export function serializeViolations(
  violations: GuardrailViolation[],
): { id: string; severity: GuardrailSeverity; rule: string }[] {
  return violations.map((v) => ({
    id: v.guardrailId,
    severity: v.severity,
    rule: v.rule,
  }));
}
