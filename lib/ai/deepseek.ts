/**
 * Chujai Legal — DeepSeek client wrapper.
 *
 * Real API call to DeepSeek (OpenAI-compatible chat completions endpoint).
 * Falls back gracefully to a caller-supplied stub when no API key is set or
 * the upstream call fails. No external SDK dependency — plain fetch.
 *
 * Env:
 *   DEEPSEEK_API_KEY   — required for live calls
 *   DEEPSEEK_MODEL     — default "deepseek-chat"
 *   DEEPSEEK_BASE_URL  — default "https://api.deepseek.com" (OpenRouter etc. supported)
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  /** Whether the response came from DeepSeek (false = fallback/stub). */
  live: boolean;
  content: string;
  model: string;
  /** Reason for fallback, when live === false. */
  fallbackReason?: string;
}

export class DeepSeekError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "DeepSeekError";
    this.status = status;
  }
}

export function isDeepSeekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

function baseUrl(): string {
  return (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(
    /\/+$/,
    "",
  );
}

function model(): string {
  return process.env.DEEPSEEK_MODEL || "deepseek-chat";
}

/**
 * Call DeepSeek with the given messages. Returns a `ChatResult` — never throws
 * on missing key (returns `live: false`), but WILL throw `DeepSeekError` on a
 * hard upstream error so the caller can choose a fallback path.
 */
export async function chat(messages: ChatMessage[]): Promise<ChatResult> {
  if (!isDeepSeekConfigured()) {
    return {
      live: false,
      content: "",
      model: "stub",
      fallbackReason: "DEEPSEEK_API_KEY not set",
    };
  }

  const key = process.env.DEEPSEEK_API_KEY!;
  const url = `${baseUrl()}/chat/completions`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model(),
        messages,
        temperature: 0.4,
        max_tokens: 2048,
      }),
      // Serverless-friendly: don't hang forever on a slow upstream.
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return {
      live: false,
      content: "",
      model: "stub",
      fallbackReason: err instanceof Error ? err.message : "network error",
    };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new DeepSeekError(
      `DeepSeek API ${res.status}: ${text.slice(0, 300)}`,
      res.status,
    );
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) {
    throw new DeepSeekError("DeepSeek returned an empty completion");
  }

  return { live: true, content, model: model() };
}

/**
 * Convenience: run a single system + user turn and return the raw text.
 * Throws `DeepSeekError` on hard failure; returns "" if not configured.
 */
export async function generate(
  system: string,
  user: string,
): Promise<ChatResult> {
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  return chat(messages);
}

/**
 * Best-effort parse of an assistant reply into JSON. The model is asked to
 * answer with a JSON object; this strips markdown fences and trailing commas
 * before parsing, and returns null on failure.
 */
export function parseJsonFromText<T>(text: string): T | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced ?? trimmed)
    .replace(/^[^{\[]+/, "")
    .replace(/[^}\]]+$/, "")
    .trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    try {
      return JSON.parse(candidate.replace(/,\s*([}\]])/g, "$1")) as T;
    } catch {
      return null;
    }
  }
}
