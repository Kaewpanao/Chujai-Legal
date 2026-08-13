/**
 * Chujai Legal — AI assistant chat route.
 * POST /api/ai/assistant
 * Multi-turn chat with context. Calls DeepSeek when configured; otherwise
 * returns a warm canned reply (no upstream dependency).
 */

import { chat, type ChatMessage } from "@/lib/ai/deepseek";
import { buildAssistantPrompt } from "@/lib/ai/prompt";
import { checkGuardrails, serializeViolations } from "@/lib/legal/guardrails-check";
import { error, json, readJson } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AssistantBody {
  messages?: ChatMessage[];
  context?: string;
}

export async function POST(req: Request) {
  const body = await readJson<AssistantBody>(req);
  const messages = body?.messages;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return error("กรุณาระบุข้อความ (messages)", 400);
  }

  const system = buildAssistantPrompt({ context: body?.context });

  try {
    const result = await chat([
      { role: "system", content: system },
      ...messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10),
    ]);

    if (result.live && result.content) {
      const check = checkGuardrails(result.content);
      return json({
        reply: check.blocked
          ? "ขอโทษนะ ฉันไม่สามารถตอบแบบนั้นได้ — ฉันให้ข้อมูลกฎหมายและทางเลือกเท่านั้น ไม่ตัดสินใจแทนคุณ หากมีคำถามอื่น เล่าให้ฟังได้เลยนะคะ"
          : result.content,
        aiGenerated: !check.blocked,
        guardrails: serializeViolations(check.violations),
      });
    }
  } catch {
    // Fall through to canned reply.
  }

  return json({
    reply:
      "เราเข้าใจความรู้สึกของคุณนะ 🙏 ตอนนี้ระบบผู้ช่วยอัจฉริยะยังไม่พร้อมใช้งาน " +
      "แต่คุณสามารถใช้การค้นหากฎหมาย หรือเริ่มวินิจฉัยปัญหาได้จากหน้าหลัก — " +
      "หรือลองเล่าปัญหาของคุณให้ฟัง แล้วเราจะช่วยหาทางให้ค่ะ",
    aiGenerated: false,
    guardrails: [],
  });
}
