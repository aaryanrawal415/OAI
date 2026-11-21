import { describe, expect, it } from "vitest";
import type { User } from "../api/types";
import { canAccessAdminProfile, hasPermission } from "../auth/permissions";

const user: User = {
  id: "user-1",
  email: "optifreight.ai@gmail.com",
  name: "Admin",
  role: "platform_admin",
  tier: "basic",
};

describe("organization owner and private admin access", () => {
  it("gives organization owners fleet supervision and offer acceptance", () => {
    const owner = { ...user, role: "organization_owner" as const, email: "owner@example.com" };
    expect(hasPermission(owner, "fleet:manage")).toBe(true);
    expect(hasPermission(owner, "jobs:accept")).toBe(true);
    expect(hasPermission(owner, "users:manage")).toBe(true);
  });

  it("only exposes the admin profile to the designated HTTP-authenticated platform admin", () => {
    expect(canAccessAdminProfile(user, true)).toBe(true);
    expect(canAccessAdminProfile(user, false)).toBe(false);
    expect(canAccessAdminProfile({ ...user, email: "other@example.com" }, true)).toBe(false);
    expect(canAccessAdminProfile({ ...user, role: "admin" }, true)).toBe(false);
  });
});
