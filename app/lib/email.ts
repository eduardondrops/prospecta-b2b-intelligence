import { env } from "cloudflare:workers";

type EmailKind = "verify_email" | "reset_password";

function bindings() {
  return env as Cloudflare.Env & {
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    APP_BASE_URL?: string;
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function sendAccountEmail(input: { idempotencyKey: string; kind: EmailKind; email: string; name: string; token: string }) {
  const config = bindings();
  if (!config.RESEND_API_KEY) return { sent: false, reason: "not_configured" as const };

  const appUrl = (config.APP_BASE_URL ?? "https://prospectaworbita.site").replace(/\/$/, "");
  const path = input.kind === "verify_email" ? "/verificar-email" : "/redefinir-senha";
  const actionUrl = `${appUrl}${path}?token=${encodeURIComponent(input.token)}`;
  const subject = input.kind === "verify_email" ? "Confirme seu acesso ao Prospecta Worbita" : "Redefina sua senha do Prospecta Worbita";
  const actionLabel = input.kind === "verify_email" ? "Confirmar meu e-mail" : "Redefinir minha senha";
  const expiry = input.kind === "verify_email" ? "24 horas" : "30 minutos";
  const safeName = escapeHtml(input.name);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
      "User-Agent": "Prospecta-Worbita/1.0",
    },
    body: JSON.stringify({
      from: config.EMAIL_FROM ?? "Prospecta Worbita <acesso@prospectaworbita.site>",
      to: [input.email],
      subject,
      text: `Olá, ${input.name}. ${actionLabel}: ${actionUrl}. Este link expira em ${expiry}. Se você não solicitou esta ação, ignore esta mensagem.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#14251e"><h1 style="font-family:Georgia,serif">Prospecta Worbita</h1><p>Olá, ${safeName}.</p><p>Use o botão abaixo para continuar. O link expira em ${expiry}.</p><p><a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#15382b;color:#fff;padding:14px 20px;text-decoration:none">${actionLabel}</a></p><p>Se você não solicitou esta ação, ignore esta mensagem.</p></div>`,
    }),
  });

  if (!response.ok) return { sent: false, reason: "provider_error" as const, status: response.status };
  return { sent: true as const };
}
