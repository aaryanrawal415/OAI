import type { ReactNode } from "react";
import type { Candidate } from "../api/types";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Stamp } from "../components/ui/Stamp";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDuration, formatInr, formatKg, formatKm, formatScore } from "../lib/format";
import { eligibilityLabel } from "../lib/verdict";
import { useWorkspace } from "../state/WorkspaceContext";

export function ComparePage() {
  usePageTitle("Compare");
  const { state, dispatch, routeChanged } = useWorkspace();
  const match = state.lastMatch;
  const chosen = (match?.candidates ?? []).filter((c) => state.compareIds.includes(c.id));

  if (chosen.length < 2) {
    return (
      <Card>
        <EmptyState
          title="Choose two or three jobs to compare"
          action={<ButtonLink to="/" variant="primary">Go to the workspace</ButtonLink>}
        >
          Tick Compare on the jobs you want side by side. You have chosen {chosen.length}.
        </EmptyState>
      </Card>
    );
  }

  const best = Math.max(...chosen.map((c) => c.net_inr.expected ?? -Infinity));
  const count = (c: Candidate, verdict: "fail" | "unknown"): number => c.checks.filter((k) => k.verdict === verdict).length;

  const rows: { label: string; cell: (c: Candidate) => ReactNode }[] = [
    { label: "Result", cell: (c) => <Stamp verdict={c.eligible} label={eligibilityLabel(c.eligible)} /> },
    { label: "Route", cell: (c) => (c.route_class === "on_route" ? "On route" : "Off route") },
    { label: "Weight", cell: (c) => formatKg(c.weight_kg) },
    { label: "Payment", cell: (c) => formatInr(c.revenue_inr) },
    {
      label: "Estimated net (expected)",
      cell: (c) => (
        <>
          {formatInr(c.net_inr.expected)}
          {c.net_inr.expected != null && c.net_inr.expected === best && <span className="badge badge--accent" style={{ marginLeft: "0.4rem" }}>Highest estimate</span>}
        </>
      ),
    },
    { label: "Net range", cell: (c) => (c.net_inr.low == null ? "—" : `${formatInr(c.net_inr.low)} to ${formatInr(c.net_inr.high)}`) },
    { label: "Pickup detour", cell: (c) => formatKm(c.pickup_excursion_km) },
    { label: "Drop detour", cell: (c) => formatKm(c.drop_excursion_km) },
    { label: "Extra distance", cell: (c) => formatKm(c.extra_distance_km) },
    { label: "Extra active time", cell: (c) => formatDuration(c.extra_active_minutes) },
    { label: "Counts as", cell: (c) => (c.is_bundle ? `1 job (bundle of ${c.bundle_size})` : "1 job") },
    { label: "Checks failed", cell: (c) => count(c, "fail") },
    { label: "Checks unverified", cell: (c) => count(c, "unknown") },
    { label: "Demo score", cell: (c) => formatScore(c.baseline_score) },
  ];

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Compare</span>
          <h1>Side by side</h1>
        </div>
        <Button onClick={() => dispatch({ type: "clearCompare" })}>Clear selection</Button>
      </div>
      {routeChanged && (
        <p className="banner banner--warn" role="alert">
          The route changed after this search. These figures are out of date.
        </p>
      )}
      <Card>
        <div className="table-scroll">
          <table className="table">
            <caption className="sr-only">Comparison of the selected jobs</caption>
            <thead>
              <tr>
                <th scope="col">&nbsp;</th>
                {chosen.map((c) => (
                  <th scope="col" key={c.id}>
                    {c.title}
                    <div className="row" style={{ marginTop: "0.4rem", gap: "0.3rem" }}>
                      <ButtonLink to={`/match/${c.id}`} small>
                        Details
                      </ButtonLink>
                      <Button small variant="ghost" onClick={() => dispatch({ type: "toggleCompare", id: c.id })} aria-label={`Remove ${c.title}`}>
                        Remove
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {chosen.map((c) => (
                    <td key={c.id} className="mono">
                      {row.cell(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field__hint" style={{ marginTop: "0.75rem" }}>
          "Highest estimate" compares estimates only. A job that is not eligible cannot be accepted whatever its payment.
        </p>
      </Card>
    </div>
  );
}
