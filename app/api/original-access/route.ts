import { env } from "cloudflare:workers";
import { currentUser } from "@/app/lib/auth";

type AccessResponse = {
  sucesso?: boolean;
  token?: string;
  erro?: string;
};

export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Sessão inválida." }, { status: 401 });
  if (user.plan !== "scale") {
    return Response.json({ error: "A plataforma completa está disponível no plano Scale." }, { status: 403 });
  }

  const bindings = env as Cloudflare.Env & {
    ORIGINAL_APP_URL?: string;
  };
  const appUrl = bindings.ORIGINAL_APP_URL;
  if (!appUrl) {
    console.error("original_access_not_configured");
    return Response.json({ error: "A plataforma completa ainda não está configurada." }, { status: 503 });
  }

  try {
    const response = await fetch(`${appUrl.replace(/\/$/, "")}/api/bridge/access`, {
      method: "POST",
      headers: { Cookie: request.headers.get("cookie") ?? "", Accept: "application/json" },
    });
    const data = await response.json() as AccessResponse;
    if (!response.ok || !data.sucesso || !data.token) {
      console.error("original_access_failed", response.status, data.erro ?? "unknown");
      return Response.json({ error: "Não foi possível abrir a plataforma completa." }, { status: 502 });
    }

    const destination = new URL("/acesso", appUrl);
    destination.searchParams.set("token", data.token);
    return Response.json({ url: destination.toString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("original_access_failed", error);
    return Response.json({ error: "Não foi possível conectar à plataforma completa." }, { status: 502 });
  }
}
