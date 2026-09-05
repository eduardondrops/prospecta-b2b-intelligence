import { describe, expect, it } from "vitest";
import { isSameOrigin } from "./security";

describe("same-origin protection", () => {
  it("accepts a same-origin browser request", () => {
    const request = new Request("https://prospectaworbita.site/api/auth/login", { headers: { Origin: "https://prospectaworbita.site", "Sec-Fetch-Site": "same-origin" } });
    expect(isSameOrigin(request)).toBe(true);
  });

  it("rejects cross-site requests", () => {
    const request = new Request("https://prospectaworbita.site/api/auth/login", { headers: { Origin: "https://attacker.invalid", "Sec-Fetch-Site": "cross-site" } });
    expect(isSameOrigin(request)).toBe(false);
  });

  it("allows non-browser clients without Origin for operational compatibility", () => {
    expect(isSameOrigin(new Request("https://prospectaworbita.site/api/auth/login"))).toBe(true);
  });
});
