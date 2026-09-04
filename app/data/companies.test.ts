import { describe, expect, it } from "vitest";
import { companies } from "./companies";

describe("synthetic prospect dataset", () => {
  it("uses unique public identifiers", () => {
    const ids = companies.map((company) => company.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps qualification scores within the documented range", () => {
    expect(companies.every((company) => company.score >= 0 && company.score <= 100)).toBe(true);
  });

  it("contains no live URLs or email addresses", () => {
    const serialized = JSON.stringify(companies);
    expect(serialized).not.toMatch(/https?:\/\//i);
    expect(serialized).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
  });
});
