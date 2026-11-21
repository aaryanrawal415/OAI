import type { ClaimTag, Verdict } from "../api/types";

export const VERDICT_LABEL: Record<Verdict, string> = {
  pass: "Pass",
  fail: "Fail",
  unknown: "Unknown",
};

export const VERDICT_SYMBOL: Record<Verdict, string> = {
  pass: "✓",
  fail: "✗",
  unknown: "?",
};

export const CLAIM_LABEL: Record<ClaimTag, string> = {
  fact: "Fact",
  calculation: "Calculation",
  estimate: "Estimate",
  recommendation: "Recommendation",
  ml_estimate: "ML-estimated",
};

/** Combine verdicts: any fail gives fail; otherwise any unknown gives unknown; otherwise pass. */
export function combineVerdicts(verdicts: Verdict[]): Verdict {
  if (verdicts.includes("fail")) return "fail";
  if (verdicts.includes("unknown")) return "unknown";
  return "pass";
}

/** Plain-language status for a candidate's overall verdict. */
export function eligibilityLabel(verdict: Verdict): string {
  if (verdict === "pass") return "Eligible";
  if (verdict === "unknown") return "Unverified";
  return "Rejected";
}
