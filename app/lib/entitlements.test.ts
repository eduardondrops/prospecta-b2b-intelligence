import { describe, expect, it } from "vitest";
import { clampRequestedLeads, planEntitlements, saoPauloDayStart, usageWindowStart } from "./entitlements";

describe("commercial entitlements", () => {
  it("matches the approved lead and WhatsApp limits", () => {
    expect(planEntitlements.trial).toMatchObject({ leadLimit: 15, whatsappConnections: 1, period: "trial" });
    expect(planEntitlements.essential).toMatchObject({ leadLimit: 15, whatsappConnections: 1, period: "day" });
    expect(planEntitlements.growth).toMatchObject({ leadLimit: 45, whatsappConnections: 3, period: "day" });
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
});
