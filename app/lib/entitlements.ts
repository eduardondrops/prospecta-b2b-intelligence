import type { Plan } from "@/app/lib/auth";

export type EntitlementPeriod = "trial" | "day";

export type PlanEntitlement = {
  leadLimit: number;
  maxResultsPerSearch: number;
  whatsappConnections: number | null;
  period: EntitlementPeriod;
  export: boolean;
  enrichment: boolean;
  automation: boolean;
};

// Scale uses a conservative technical guardrail until a commercial override model is approved.
export const planEntitlements: Record<Plan, PlanEntitlement> = {
  trial: { leadLimit: 15, maxResultsPerSearch: 5, whatsappConnections: 1, period: "trial", export: false, enrichment: false, automation: false },
  essential: { leadLimit: 15, maxResultsPerSearch: 15, whatsappConnections: 1, period: "day", export: true, enrichment: false, automation: false },
  growth: { leadLimit: 45, maxResultsPerSearch: 45, whatsappConnections: 3, period: "day", export: true, enrichment: true, automation: true },
  scale: { leadLimit: 5_000, maxResultsPerSearch: 250, whatsappConnections: null, period: "day", export: true, enrichment: true, automation: true },
};

const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
}

function timeZoneOffsetMs(date: Date) {
  const parts = zonedParts(date);
  const representedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return representedAsUtc - date.getTime();
}

export function saoPauloDayStart(now = new Date()) {
  const local = zonedParts(now);
  const midnightGuess = new Date(Date.UTC(local.year, local.month - 1, local.day));
  let result = new Date(midnightGuess.getTime() - timeZoneOffsetMs(midnightGuess));
  result = new Date(midnightGuess.getTime() - timeZoneOffsetMs(result));
  return result.toISOString();
}

export function usageWindowStart(plan: Plan, now = new Date()) {
  return planEntitlements[plan].period === "day" ? saoPauloDayStart(now) : "1970-01-01T00:00:00.000Z";
}

export function clampRequestedLeads(plan: Plan, requested: number, remaining: number) {
  const policy = planEntitlements[plan];
  const normalized = Math.max(1, Math.floor(Number.isFinite(requested) ? requested : policy.maxResultsPerSearch));
  return Math.max(0, Math.min(normalized, policy.maxResultsPerSearch, remaining));
}
