import type { ClaimTag } from "../api/types";
import { CLAIM_LABEL } from "../lib/verdict";

const HELP: Record<ClaimTag, string> = {
  fact: "Stated by the data or a direct check.",
  calculation: "Worked out from the numbers shown.",
  estimate: "A cost or earnings estimate: it may differ in practice.",
  recommendation: "Advice from the system. You decide.",
  ml_estimate: "Produced by a trained model.",
};

export function ConfidenceBadge({ tag }: { tag: ClaimTag }) {
  return (
    <span className={`badge ${tag === "ml_estimate" ? "badge--accent" : "badge--info"}`} title={HELP[tag]}>
      {CLAIM_LABEL[tag]}
    </span>
  );
}
