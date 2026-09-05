import { createSession, database, hashPassword, normalizeEmail, secureCompare, sessionCookie } from "@/app/lib/auth";
import { enforceRateLimit, logSecurityEvent, rateLimitResponse, requestFingerprint, requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

type LoginRow = { id: string; password_hash: string; password_salt: string; status: string; email_verified_at: string | null };

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    const body = await request.json().catch(() => null) as { email?: string; password?: string; website?: string } | null;
    if (body?.website) return Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    const email = normalizeEmail(body?.email ?? "");
    const password = body?.password ?? "";
    const fingerprint = await requestFingerprint(request);
    const limit = await enforceRateLimit(`login:${fingerprint}`, 10, 15 * 60);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const user = await database().prepare("SELECT id, password_hash, password_salt, status, email_verified_at FROM users WHERE email = ?").bind(email).first<LoginRow>();
    if (!user) return Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    const candidate = await hashPassword(password, user.password_salt);
    if (!secureCompare(candidate.hash, user.password_hash)) return Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    if (!user.email_verified_at) return Response.json({ error: "Confirme seu e-mail antes de entrar.", code: "EMAIL_NOT_VERIFIED" }, { status: 403 });
    if (user.status !== "active") return Response.json({ error: "Esta conta não está ativa. Entre em contato com o suporte.", code: "ACCOUNT_INACTIVE" }, { status: 403 });

    const session = await createSession(user.id);
    await writeAuditEvent({ action: "session.created", actorUserId: user.id, targetUserId: user.id });
    logSecurityEvent("info", "login_succeeded", { userId: user.id });
    return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(session.rawToken), "Cache-Control": "no-store" } });
  } catch (error) {
    logSecurityEvent("error", "login_failed", { error: error instanceof Error ? error.message : "unknown" });
    return Response.json({ error: "O login está temporariamente indisponível. Tente novamente em instantes." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
