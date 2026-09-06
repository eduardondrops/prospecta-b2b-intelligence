import { describe, expect, it } from "vitest";
import { campaignAllowance, clampRequestedLeads, planEntitlements, saoPauloDayStart, usageWindowStart, whatsappConnectionAllowed } from "./entitlements";

describe("commercial entitlements", () => {
  it("matches the approved lead and WhatsApp limits", () => {
    expect(planEntitlements.trial).toMatchObject({ leadLimit: 15, whatsappConnections: 1, period: "trial", campaignDailyLimit: 15, campaignTotalLimit: 15 });
    expect(planEntitlements.essential).toMatchObject({ leadLimit: 15, whatsappConnections: 1, period: "day", campaignDailyLimit: 15 });
    expect(planEntitlements.growth).toMatchObject({ leadLimit: 45, whatsappConnections: 3, period: "day", campaignDailyLimit: 45 });
    expect(planEntitlements.scale).toMatchObject({ leadLimit: 5_000, whatsappConnections: null, period: "day", campaignDailyLimit: 5_000 });
  });

  it("keeps the modules available while enforcing plan limits", () => {
    for (const entitlement of Object.values(planEntitlements)) {
      expect(entitlement).toMatchObject({ save: true, export: true, automation: true, campaign: true, manualCampaignConfirmation: true });
    }
  });

  it("starts a paid daily allowance at midnight in Sao Paulo", () => {
    expect(saoPauloDayStart(new Date("2026-09-05T21:30:00.000Z"))).toBe("2026-09-05T03:00:00.000Z");
    expect(usageWindowStart("essential", new Date("2026-09-05T02:30:00.000Z"))).toBe("2026-09-04T03:00:00.000Z");
  });

  it("keeps trial usage across its complete lifetime", () => {
    expect(usageWindowStart("trial")).toBe("1970-01-01T00:00:00.000Z");
  });

  it("clamps a reservation to the search cap and remaining leads", () => {
    expect(clampRequestedLeads("trial", 20, 15)).toBe(5);
    expect(clampRequestedLeads("growth", 60, 12)).toBe(12);
    expect(clampRequestedLeads("essential", 10, 0)).toBe(0);
  });

  it.each([
    ["trial", 14, 5, 1],
    ["essential", 15, 1, 0],
    ["growth", 40, 10, 5],
    ["scale", 4_999, 10, 1],
  ] as const)("enforces the campaign allowance for %s", (plan, used, requested, expected) => {
    expect(campaignAllowance(plan, requested, used)).toBe(expected);
  });

  it("enforces WhatsApp connection limits for every plan", () => {
    expect(whatsappConnectionAllowed("trial", 1)).toBe(true);
    expect(whatsappConnectionAllowed("trial", 2)).toBe(false);
    expect(whatsappConnectionAllowed("essential", 2)).toBe(false);
    expect(whatsappConnectionAllowed("growth", 3)).toBe(true);
    expect(whatsappConnectionAllowed("growth", 4)).toBe(false);
    expect(whatsappConnectionAllowed("scale", 10_000)).toBe(true);
  });
});
