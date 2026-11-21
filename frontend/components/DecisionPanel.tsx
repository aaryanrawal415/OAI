import type { CheckResult, Verdict } from "../api/types";
import { Stamp } from "./ui/Stamp";
import { ConfidenceBadge } from "./ConfidenceBadge";

const ORDER: Record<Verdict, number> = { fail: 0, unknown: 1, pass: 2 };

function show(value: string | number | null, unit: string | null): string {
  if (value == null) return "not available";
  const text = typeof value === "number" ? value.toLocaleString("en-IN") : value;
  return unit ? `${text} ${unit}` : text;
}

/** Every check the engine ran, with its result. Failed and unverified checks come first. */
export function DecisionPanel({ checks }: { checks: CheckResult[] }) {
  const sorted = [...checks].sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict]);
  const count = (v: Verdict): number => checks.filter((c) => c.verdict === v).length;
  return (
    <div className="stack">
      <p className="small muted" aria-live="polite">
        <span className="mono">{count("pass")}</span> passed, <span className="mono">{count("fail")}</span> failed,{" "}
        <span className="mono">{count("unknown")}</span> could not be verified.
      </p>
      <ul className="checks">
        {sorted.map((check) => (
          <li className="checks__item" key={check.rule_code}>
            <Stamp verdict={check.verdict} />
            <div className="stack" style={{ gap: "0.25rem" }}>
              <div className="row" style={{ gap: "0.5rem" }}>
                <span className="checks__label">{check.label}</span>
                <ConfidenceBadge tag={check.claim_tag} />
              </div>
              <p className="small">{check.message}</p>
              {(check.value != null || check.threshold != null) && (
                <p className="small muted mono">
                  Value: {show(check.value, check.unit)}
                  {check.threshold != null && <> · Limit: {show(check.threshold, check.unit)}</>}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
