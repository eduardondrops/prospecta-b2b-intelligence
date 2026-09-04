import { createSession, database, hashPassword, normalizeEmail, secureCompare, sessionCookie } from "@/app/lib/auth";

type LoginRow = { id: string; password_hash: string; password_salt: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password ?? "";
  const user = await database().prepare("SELECT id, password_hash, password_salt FROM users WHERE email = ?").bind(email).first<LoginRow>();
  if (!user) return Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 });

  const candidate = await hashPassword(password, user.password_salt);
  if (!secureCompare(candidate.hash, user.password_hash)) return Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 });

  const session = await createSession(user.id);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(session.rawToken), "Cache-Control": "no-store" } });
}

