import { database, expiredSessionCookie, hashToken, readSessionToken } from "@/app/lib/auth";

export async function POST(request: Request) {
  const token = readSessionToken(request);
  if (token) await database().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await hashToken(token)).run();
  return Response.json({ ok: true }, { headers: { "Set-Cookie": expiredSessionCookie(), "Cache-Control": "no-store" } });
}

