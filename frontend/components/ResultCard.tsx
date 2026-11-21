import type { Candidate } from "../api/types";
import { formatInr, formatKg, formatKm, formatScore } from "../lib/format";
import { eligibilityLabel } from "../lib/verdict";
import { ButtonLink, Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Stamp } from "./ui/Stamp";

interface Props {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
  compared: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
}

function routeBadge(c: Candidate): string {
  if (c.route_class === "on_route") return "On route";
  const worst = Math.max(c.pickup_excursion_km ?? 0, c.drop_excursion_km ?? 0);
  return c.pickup_excursion_km == null || c.drop_excursion_km == null ? "Off route (not verified)" : `Off route, up to ${formatKm(worst)}`;
}

export function ResultCard({ candidate: c, selected, onSelect, compared, compareDisabled, onToggleCompare }: Props) {
  const range =
    c.net_inr.low != null && c.net_inr.high != null ? `${formatInr(c.net_inr.low)} to ${formatInr(c.net_inr.high)}` : null;
  return (
    <Card tone={c.eligible} selected={selected}>
      <article className="stack" aria-label={`${c.title}: ${eligibilityLabel(c.eligible)}`}>
        <div className="row-between" style={{ alignItems: "flex-start" }}>
          <h3 style={{ flex: 1, minWidth: "10rem" }}>{c.title}</h3>
          <Stamp verdict={c.eligible} label={eligibilityLabel(c.eligible)} />
        </div>
        <div className="row" style={{ gap: "0.4rem" }}>
          <span className="badge">{routeBadge(c)}</span>
          {c.is_bundle && <span className="badge badge--accent">Bundle of {c.bundle_size} (counts as 1)</span>}
          {c.source_type === "synthetic" && <span className="badge badge--demo">Demo listing</span>}
          {c.source_type === "manual" && <span className="badge badge--info">Your listing</span>}
        </div>
        <p className="small muted">
          {c.pickup.name} → {c.drop.name}
        </p>
        <dl className="kv">
          <dt>Weight</dt>
          <dd>{formatKg(c.weight_kg)}</dd>
          <dt>Payment</dt>
          <dd>{formatInr(c.revenue_inr)}</dd>
          <dt>Estimated net</dt>
          <dd>{formatInr(c.net_inr.expected)}</dd>
          <dt>Extra distance</dt>
          <dd>{formatKm(c.extra_distance_km)}</dd>
          <dt>Demo score</dt>
          <dd>{formatScore(c.baseline_score)}</dd>
        </dl>
        {range && <p className="small muted">Net estimate range: {range} (an estimate, not a guarantee).</p>}
        <div className="row-between">
          <div className="row" style={{ gap: "0.4rem" }}>
            <ButtonLink to={`/match/${c.id}`} small variant="ink">
              Details
            </ButtonLink>
            <Button small onClick={onSelect} aria-pressed={selected}>
              Show on map
            </Button>
          </div>
          <label className="check" style={{ alignItems: "center" }}>
            <input type="checkbox" checked={compared} disabled={compareDisabled && !compared} onChange={onToggleCompare} />
            <span className="small">
              Compare<span className="sr-only"> {c.title}</span>
            </span>
          </label>
        </div>
      </article>
    </Card>
  );
}
