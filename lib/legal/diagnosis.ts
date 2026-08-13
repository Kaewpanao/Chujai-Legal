/**
 * Chujai Legal — client-side AI diagnosis helper.
 *
 * Shared type + fetch wrapper used by the concierge and diagnosis pages to
 * call `POST /api/ai/diagnose`. Pure client module (relative fetch, no server
 * imports) so it is safe to import from "use client" components.
 */

export interface DiagnosisSource {
  lawName: string;
  ref: string;
  label: string;
}

export interface DiagnosisResult {
  summary: string;
  category: string;
  rights: string[];
  options: string[];
  urgentSteps: string[];
  sources: DiagnosisSource[];
  aiGenerated?: boolean;
  model?: string;
  guardrails?: { id: string; severity: string; rule: string }[];
  note?: string;
}

export interface DiagnosisPayload {
  categoryId: string;
  subProblem?: string;
  answers?: Record<string, string>;
  fearLevel?: string;
}

/** Call the AI diagnosis route and return the (possibly fallback) result. */
export async function runDiagnosis(
  payload: DiagnosisPayload,
): Promise<DiagnosisResult> {
  const res = await fetch("/api/ai/diagnose", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `การวินิจฉัยล้มเหลว (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as DiagnosisResult;
}
