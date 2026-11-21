import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CheckResult } from "../api/types";
import { DecisionPanel } from "../components/DecisionPanel";

const check = (rule_code: string, verdict: CheckResult["verdict"]): CheckResult => ({
  rule_code,
  label: `Check ${rule_code}`,
  verdict,
  value: null,
  threshold: null,
  unit: null,
  claim_tag: "fact",
  message: `Message ${rule_code}`,
});

describe("DecisionPanel", () => {
  it("lists failed checks first, then unverified, then passed", () => {
    render(<DecisionPanel checks={[check("a", "pass"), check("b", "unknown"), check("c", "fail")]} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0].textContent).toContain("Check c");
    expect(items[1].textContent).toContain("Check b");
    expect(items[2].textContent).toContain("Check a");
  });
  it("uses words and symbols, not colour alone", () => {
    render(<DecisionPanel checks={[check("a", "fail")]} />);
    expect(screen.getByText("Fail")).toBeInTheDocument();
  });
});
