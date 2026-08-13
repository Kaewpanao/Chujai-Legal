/**
 * Chujai Legal — LINE integration (Messaging API + LINE Login).
 *
 * Real calls to the LINE Messaging API when `LINE_CHANNEL_TOKEN` is set;
 * graceful no-op fallback otherwise. Also exposes LINE Login helpers used by
 * `/api/auth/line`.
 *
 * Env:
 *   LINE_CHANNEL_TOKEN        — Messaging API channel access token
 *   LINE_CHANNEL_ID           — LINE Login channel ID
 *   LINE_CHANNEL_SECRET       — LINE Login channel secret
 *   LINE_LOGIN_REDIRECT_URI   — callback URL for LINE Login
 */

const LINE_API = "https://api.line.me/v2/bot";

export interface LinePushResult {
  ok: boolean;
  reason?: string;
}

export function isLineConfigured(): boolean {
  return Boolean(process.env.LINE_CHANNEL_TOKEN);
}

/**
 * Push a text message to a single user via the Messaging API.
 * Returns `{ ok: false }` (with reason) instead of throwing when
 * unconfigured or on upstream failure.
 */
export async function pushMessage(
  userId: string,
  text: string,
): Promise<LinePushResult> {
  if (!isLineConfigured()) {
    return { ok: false, reason: "LINE_CHANNEL_TOKEN not set" };
  }
  try {
    const res = await fetch(`${LINE_API}/message/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text }],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, reason: `LINE API ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}

/** Reply to a webhook event using its replyToken. */
export async function replyMessage(
  replyToken: string,
  text: string,
): Promise<LinePushResult> {
  if (!isLineConfigured()) {
    return { ok: false, reason: "LINE_CHANNEL_TOKEN not set" };
  }
  try {
    const res = await fetch(`${LINE_API}/message/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text }],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, reason: `LINE API ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}

/** Broadcast a text message to all followers. */
export async function broadcast(text: string): Promise<LinePushResult> {
  if (!isLineConfigured()) {
    return { ok: false, reason: "LINE_CHANNEL_TOKEN not set" };
  }
  try {
    const res = await fetch(`${LINE_API}/message/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_TOKEN}`,
      },
      body: JSON.stringify({ messages: [{ type: "text", text }] }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, reason: `LINE API ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* LINE Login (OAuth 2.1) helpers                                            */
/* -------------------------------------------------------------------------- */

export function isLineLoginConfigured(): boolean {
  return Boolean(
    process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET,
  );
}

/** Build the LINE Login authorization URL. */
export function buildLineAuthUrl(state: string): string {
  const clientId = process.env.LINE_CHANNEL_ID ?? "";
  const redirectUri = encodeURIComponent(
    process.env.LINE_LOGIN_REDIRECT_URI ?? "",
  );
  return (
    "https://access.line.me/oauth2/v2.1/authorize" +
    `?response_type=code&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}` +
    "&scope=profile%20openid%20email"
  );
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
}

/** Exchange an authorization code for a LINE profile. */
export async function exchangeLineCode(code: string): Promise<{
  profile: LineProfile | null;
  error?: string;
}> {
  if (!isLineLoginConfigured()) {
    return { profile: null, error: "LINE Login not configured" };
  }
  try {
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINE_LOGIN_REDIRECT_URI ?? "",
        client_id: process.env.LINE_CHANNEL_ID ?? "",
        client_secret: process.env.LINE_CHANNEL_SECRET ?? "",
      }),
    });
    const tokenJson = (await tokenRes.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const accessToken = tokenJson.access_token as string | undefined;
    if (!tokenRes.ok || !accessToken) {
      return {
        profile: null,
        error: (tokenJson.error_description as string) ?? "LINE token exchange failed",
      };
    }

    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      return { profile: null, error: `LINE profile failed (${profileRes.status})` };
    }
    const p = (await profileRes.json()) as Record<string, unknown>;
    return {
      profile: {
        userId: String(p.userId ?? ""),
        displayName: String(p.displayName ?? ""),
        pictureUrl: p.pictureUrl ? String(p.pictureUrl) : undefined,
        email: p.email ? String(p.email) : undefined,
      },
    };
  } catch (err) {
    return {
      profile: null,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}
