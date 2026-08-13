/**
 * Chujai Legal — fetch-based Supabase client core.
 *
 * Talks to Supabase's GoTrue (auth) and PostgREST (database) REST APIs directly
 * so the project needs no `@supabase/supabase-js` dependency. Every method
 * returns `{ data, error }` and, when not configured, returns a typed
 * "not_configured" error so route handlers can fall back to mock data.
 */

export interface SupabaseError {
  code: string;
  message: string;
  status?: number;
}

export interface SupabaseResult<T = unknown> {
  data: T | null;
  error: SupabaseError | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface SupabaseConfig {
  url: string;
  key: string;
  /** Optional JWT for per-user authorization (from a user session). */
  accessToken?: string;
}

const NOT_CONFIGURED: SupabaseError = {
  code: "not_configured",
  message: "Supabase not configured — set SUPABASE_URL / SUPABASE_ANON_KEY",
};

function authHeaders(cfg: SupabaseConfig): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.accessToken ?? cfg.key}`,
    "Content-Type": "application/json",
  };
  return headers;
}

export class SupabaseRestClient {
  private cfg: SupabaseConfig;

  constructor(cfg: SupabaseConfig) {
    this.cfg = cfg;
  }

  get configured(): boolean {
    return Boolean(this.cfg.url && this.cfg.key);
  }

  /** Exchange email/password for a session. */
  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<SupabaseResult<AuthSession>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    try {
      const res = await fetch(
        `${this.cfg.url}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: authHeaders(this.cfg),
          body: JSON.stringify({ email, password }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          data: null,
          error: {
            code: json.error_code ?? "auth_error",
            message: json.error_description ?? json.msg ?? json.error ?? "Login failed",
            status: res.status,
          },
        };
      }
      return { data: mapSession(json), error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }

  /** Register a new user. */
  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ): Promise<SupabaseResult<AuthSession>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    try {
      const res = await fetch(`${this.cfg.url}/auth/v1/signup`, {
        method: "POST",
        headers: authHeaders(this.cfg),
        body: JSON.stringify({ email, password, data: metadata ?? {} }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          data: null,
          error: {
            code: json.error_code ?? "signup_error",
            message: json.msg ?? json.error_description ?? "Registration failed",
            status: res.status,
          },
        };
      }
      return { data: mapSession(json), error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }

  /** Fetch the user for a JWT access token. */
  async getUser(accessToken: string): Promise<SupabaseResult<AuthUser>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    try {
      const res = await fetch(`${this.cfg.url}/auth/v1/user`, {
        headers: authHeaders({ ...this.cfg, accessToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          data: null,
          error: {
            code: "auth_error",
            message: json.msg ?? "Invalid session",
            status: res.status,
          },
        };
      }
      return { data: json as AuthUser, error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }

  /** Sign out (invalidate the access token). */
  async signOut(accessToken: string): Promise<SupabaseResult<null>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    try {
      await fetch(`${this.cfg.url}/auth/v1/logout`, {
        method: "POST",
        headers: authHeaders({ ...this.cfg, accessToken }),
      });
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }

  /** Select rows from a table (PostgREST). */
  async select<T = Record<string, unknown>>(
    table: string,
    opts?: { select?: string; filter?: string; limit?: number; order?: string },
  ): Promise<SupabaseResult<T[]>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    const qs = new URLSearchParams();
    if (opts?.select) qs.set("select", opts.select);
    if (opts?.filter) qs.set(opts.filter.split("=")[0], opts.filter.split("=").slice(1).join("="));
    if (opts?.order) qs.set("order", opts.order);
    if (opts?.limit) qs.set("limit", String(opts.limit));
    try {
      const res = await fetch(
        `${this.cfg.url}/rest/v1/${table}?${qs.toString()}`,
        { headers: authHeaders(this.cfg) },
      );
      if (!res.ok) return { data: null, error: await pgError(res) };
      const json = await res.json();
      return { data: (Array.isArray(json) ? json : [json]) as T[], error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }

  /** Select a single row by id (assumes an `id` column). */
  async selectOne<T = Record<string, unknown>>(
    table: string,
    id: string,
  ): Promise<SupabaseResult<T | null>> {
    const result = await this.select<T>(table, {
      select: "*",
      filter: `id=eq.${id}`,
      limit: 1,
    });
    if (result.error) return { data: null, error: result.error };
    return { data: result.data?.[0] ?? null, error: null };
  }

  /** Insert row(s) and return the created row(s). */
  async insert<T = Record<string, unknown>>(
    table: string,
    row: T | T[],
  ): Promise<SupabaseResult<T[]>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    try {
      const res = await fetch(`${this.cfg.url}/rest/v1/${table}`, {
        method: "POST",
        headers: { ...authHeaders(this.cfg), Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      if (!res.ok) return { data: null, error: await pgError(res) };
      const json = await res.json();
      return { data: (Array.isArray(json) ? json : [json]) as T[], error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }

  /** Update rows matching `match` (column=value) and return updated rows. */
  async update<T = Record<string, unknown>>(
    table: string,
    match: Record<string, string>,
    patch: Record<string, unknown>,
  ): Promise<SupabaseResult<T[]>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    const qs = Object.entries(match)
      .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
      .join("&");
    try {
      const res = await fetch(`${this.cfg.url}/rest/v1/${table}?${qs}`, {
        method: "PATCH",
        headers: { ...authHeaders(this.cfg), Prefer: "return=representation" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return { data: null, error: await pgError(res) };
      const json = await res.json();
      return { data: (Array.isArray(json) ? json : [json]) as T[], error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }

  /** Delete rows matching `match`. */
  async delete(
    table: string,
    match: Record<string, string>,
  ): Promise<SupabaseResult<null>> {
    if (!this.configured) return { data: null, error: NOT_CONFIGURED };
    const qs = Object.entries(match)
      .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
      .join("&");
    try {
      const res = await fetch(`${this.cfg.url}/rest/v1/${table}?${qs}`, {
        method: "DELETE",
        headers: authHeaders(this.cfg),
      });
      if (!res.ok) return { data: null, error: await pgError(res) };
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: networkError(err) };
    }
  }
}

function mapSession(json: Record<string, unknown>): AuthSession {
  const user = (json.user ?? {}) as Record<string, unknown>;
  const rawMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    accessToken: String(json.access_token ?? ""),
    refreshToken: String(json.refresh_token ?? ""),
    expiresIn: Number(json.expires_in ?? 3600),
    user: {
      id: String(user.id ?? ""),
      email: String(user.email ?? ""),
      role: String(user.role ?? "consumer"),
      name: String(rawMeta.name ?? rawMeta.full_name ?? ""),
    },
  };
}

function networkError(err: unknown): SupabaseError {
  return {
    code: "network_error",
    message: err instanceof Error ? err.message : "Network error",
  };
}

async function pgError(res: Response): Promise<SupabaseError> {
  const json = await res.json().catch(() => ({}));
  return {
    code: json.code ?? "db_error",
    message: json.message ?? json.details ?? `Database error (${res.status})`,
    status: res.status,
  };
}
