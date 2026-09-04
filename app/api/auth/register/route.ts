import { createSession, database, hashPassword, isValidEmail, normalizeEmail, sessionCookie } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
  const body = await request.json().catch(() => null) as { name?: string; company?: string; email?: string; password?: string } | null;
  const name = body?.name?.trim() ?? "";
  const company = body?.company?.trim() ?? "";
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password ?? "";

  if (name.length < 2 || name.length > 80) return Response.json({ error: "Informe seu nome completo." }, { status: 400 });
  if (!isValidEmail(email)) return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
  if (password.length < 10 || password.length > 128) return Response.json({ error: "Use uma senha com pelo menos 10 caracteres." }, { status: 400 });

  const existing = await database().prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return Response.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });

  const userId = crypto.randomUUID();
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const passwordData = await hashPassword(password);
  await database().prepare(
    "INSERT INTO users (id, name, company, email, password_hash, password_salt, plan, trial_ends_at) VALUES (?, ?, ?, ?, ?, ?, 'trial', ?)",
  ).bind(userId, name, company, email, passwordData.hash, passwordData.salt, trialEndsAt).run();

  const session = await createSession(userId);
  return Response.json({ ok: true }, { status: 201, headers: { "Set-Cookie": sessionCookie(session.rawToken), "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("registration_failed", error);
    return Response.json({ error: "O cadastro está temporariamente indisponível. Tente novamente em instantes." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
