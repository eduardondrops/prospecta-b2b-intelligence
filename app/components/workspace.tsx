"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Workspace() {
  const router = useRouter();
  const [platformError, setPlatformError] = useState("");

  useEffect(() => {
    async function loadSession() {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok) { router.replace("/login"); return; }
      const accessResponse = await fetch("/api/original-access", { method: "POST" });
      const access = await accessResponse.json() as { url?: string; error?: string };
      if (accessResponse.ok && access.url) { window.location.assign(access.url); return; }
      setPlatformError(access.error ?? "Não foi possível abrir a plataforma completa.");
    }
    void loadSession();
  }, [router]);

  return <main className="workspace-loading"><span className="brand-mark">P</span><p>{platformError || "Abrindo sua plataforma Prospecta…"}</p>{platformError ? <><a className="button button-primary" href="/workspace">Tentar novamente</a><a href="/conta/seguranca">Segurança da conta</a></> : null}</main>;
}
