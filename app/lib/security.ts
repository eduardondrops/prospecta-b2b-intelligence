import { database, hashToken } from "@/app/lib/auth";

type LogLevel = "info" | "warn" | "error";

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export function requireSameOrigin(request: Request) {
  if (isSameOrigin(request)) return null;
  return Response.json({ error: "Origem da solicitação não permitida." }, { status: 403, headers: { "Cache-Control": "no-store" } });
}

export async function requestFingerprint(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return hashToken(`ip:${forwarded}`);
}

export async function enforceRateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + windowSeconds;
  const row = await database().prepare(
    `INSERT INTO auth_rate_limits (key, count, window_started_at, expires_at)
     VALUES (?, 1, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN auth_rate_limits.expires_at <= excluded.window_started_at THEN 1 ELSE auth_rate_limits.count + 1 END,
       window_started_at = CASE WHEN auth_rate_limits.expires_at <= excluded.window_started_at THEN excluded.window_started_at ELSE auth_rate_limits.window_started_at END,
       expires_at = CASE WHEN auth_rate_limits.expires_at <= excluded.window_started_at THEN excluded.expires_at ELSE auth_rate_limits.expires_at END
     RETURNING count, expires_at`,
  ).bind(key, now, expiresAt).first<{ count: number; expires_at: number }>();
  const count = row?.count ?? limit + 1;
  return { allowed: count <= limit, retryAfter: Math.max(1, (row?.expires_at ?? expiresAt) - now) };
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json({ error: "Muitas tentativas. Aguarde antes de tentar novamente." }, {
    status: 429,
    headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) },
  });
}

export async function writeAuditEvent(input: {
  action: string;
  actorUserId?: string | null;
  targetUserId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await database().prepare(
    "INSERT INTO audit_events (id, actor_user_id, target_user_id, action, metadata_json) VALUES (?, ?, ?, ?, ?)",
  ).bind(
    crypto.randomUUID(),
    input.actorUserId ?? null,
    input.targetUserId ?? null,
    input.action,
    JSON.stringify(input.metadata ?? {}),
  ).run();
}

export function logSecurityEvent(level: LogLevel, event: string, details: Record<string, string | number | boolean | null> = {}) {
  const payload = JSON.stringify({ event, ...details });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.log(payload);
}
