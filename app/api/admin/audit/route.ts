import { database, requireAdmin } from "@/app/lib/auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Acesso administrativo necessário." }, { status: 403 });
  const result = await database().prepare(
    `SELECT a.id, a.action, a.metadata_json, a.created_at,
      actor.email AS actor_email, target.email AS target_email
     FROM audit_events a
     LEFT JOIN users actor ON actor.id = a.actor_user_id
     LEFT JOIN users target ON target.id = a.target_user_id
     ORDER BY a.created_at DESC LIMIT 100`,
  ).all();
  return Response.json({ events: result.results }, { headers: { "Cache-Control": "no-store" } });
}
