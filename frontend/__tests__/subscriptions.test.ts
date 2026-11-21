import { describe, expect, it } from "vitest";
import { getPlan, planPrice, SERVICE_PLANS } from "../lib/subscriptions";

describe("subscription plans", () => {
  it("defines basic, professional, and enterprise tiers", () => {
    expect(SERVICE_PLANS.map((plan) => plan.id)).toEqual(["basic", "professional", "enterprise"]);
  });

  it("provides unlimited enterprise jobs and driver capacity", () => {
    expect(getPlan("enterprise").limits.monthlyJobs).toBe(-1);
    expect(getPlan("enterprise").limits.drivers).toBe(-1);
  });

  it("uses the annual price for annual billing", () => {
    const plan = getPlan("professional");
    expect(planPrice(plan, "annual")).toBe(49990);
  });
});
