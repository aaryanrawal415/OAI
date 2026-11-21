import type { Candidate } from "../api/types";
import { Stamp } from "./ui/Stamp";

/** Why jobs were rejected or could not be verified. Never hides a rejection to show a longer list. */
export function RejectionPanel({ candidates, kind }: { candidates: Candidate[]; kind: "fail" | "unknown" }) {
  const reasons = new Map<string, number>();
  for (const c of candidates) {
    for (const check of c.checks) {
      if (check.verdict === kind) reasons.set(check.label, (reasons.get(check.label) ?? 0) + 1);
    }
  }
  const summary = [...reasons.entries()].sort((a, b) => b[1] - a[1]);
  return (
    <div className="stack">
      {summary.length > 0 && (
        <p className="small muted">
          Most common reasons:{" "}
          {summary
            .slice(0, 4)
            .map(([label, n]) => `${label} (${n})`)
            .join(", ")}
          .
        </p>
      )}
      <ul className="checks">
        {candidates.map((c) => (
          <li className="checks__item" key={c.id}>
            <Stamp verdict={kind} />
            <div className="stack" style={{ gap: "0.2rem" }}>
              <span className="checks__label">{c.title}</span>
              {c.checks
                .filter((k) => k.verdict === kind)
                .map((k) => (
                  <span className="small muted" key={k.rule_code}>
                    {k.message}
                  </span>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
