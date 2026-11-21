import { describe, expect, it } from "vitest";
import { combineVerdicts, eligibilityLabel } from "../lib/verdict";

describe("verdict rules", () => {
  it("any fail gives fail; otherwise any unknown gives unknown; otherwise pass", () => {
    expect(combineVerdicts(["pass", "pass"])).toBe("pass");
    expect(combineVerdicts(["pass", "unknown"])).toBe("unknown");
    expect(combineVerdicts(["unknown", "fail", "pass"])).toBe("fail");
  });
  it("only a pass is called eligible", () => {
    expect(eligibilityLabel("pass")).toBe("Eligible");
    expect(eligibilityLabel("unknown")).toBe("Unverified");
    expect(eligibilityLabel("fail")).toBe("Rejected");
  });
});
