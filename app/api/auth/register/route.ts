import { createAccountToken, database, hashPassword, hashToken, isValidEmail, normalizeEmail } from "@/app/lib/auth";
import { sendAccountEmail } from "@/app/lib/email";
import { enforceRateLimit, logSecurityEvent, rateLimitResponse, requestFingerprint, requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    const body = await request.json().catch(() => null) as { name?: string; company?: string; email?: string; password?: string; website?: string; acceptedTerms?: boolean } | null;
    if (body?.website) return Response.json({ ok: true, verificationRequired: true }, { status: 201 });

    const name = body?.name?.trim() ?? "";
    const company = body?.company?.trim() ?? "";
    const email = normalizeEmail(body?.email ?? "");
    const password = body?.password ?? "";
    if (name.length < 2 || name.length > 80) return Response.json({ error: "Informe seu nome completo." }, { status: 400 });
    if (!isValidEmail(email)) return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
    if (password.length < 10 || password.length > 128) return Response.json({ error: "Use uma senha com pelo menos 10 caracteres." }, { status: 400 });
    if (!body?.acceptedTerms) return Response.json({ error: "Aceite os Termos de Uso e a Política de Privacidade." }, { status: 400 });

    const fingerprint = await requestFingerprint(request);
    const [ipLimit, emailLimit] = await Promise.all([
      enforceRateLimit(`register:ip:${fingerprint}`, 5, 60 * 60),
      enforceRateLimit(`register:email:${await hashToken(email)}`, 3, 60 * 60),
    ]);
    if (!ipLimit.allowed || !emailLimit.allowed) return rateLimitResponse(Math.max(ipLimit.retryAfter, emailLimit.retryAfter));

    const existing = await database().prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return Response.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });

    const userId = crypto.randomUUID();
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const passwordData = await hashPassword(password);
    await database().batch([
      database().prepare(
        "INSERT INTO users (id, name, company, email, password_hash, password_salt, plan, trial_ends_at, role, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'trial', ?, 'user', 'active', CURRENT_TIMESTAMP)",
      ).bind(userId, name, company, email, passwordData.hash, passwordData.salt, trialEndsAt),
      database().prepare("INSERT INTO user_consents (id, user_id, document, version, ip_hash) VALUES (?, ?, 'terms', '2026-09-05', ?)").bind(crypto.randomUUID(), userId, fingerprint),
      database().prepare("INSERT INTO user_consents (id, user_id, document, version, ip_hash) VALUES (?, ?, 'privacy', '2026-09-05', ?)").bind(crypto.randomUUID(), userId, fingerprint),
    ]);
    await writeAuditEvent({ action: "account.registered", targetUserId: userId });
    const token = await createAccountToken(userId, "verify_email", 24 * 60 * 60);
    const delivery = await sendAccountEmail({ idempotencyKey: token.id, kind: "verify_email", email, name, token: token.rawToken });
    logSecurityEvent("info", "account_registered", { userId, emailSent: delivery.sent });
    return Response.json({ ok: true, verificationRequired: true, emailSent: delivery.sent }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logSecurityEvent("error", "registration_failed", { error: error instanceof Error ? error.message : "unknown" });
    return Response.json({ error: "O cadastro está temporariamente indisponível. Tente novamente em instantes." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
