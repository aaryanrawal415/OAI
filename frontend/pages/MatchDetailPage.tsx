import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BudgetMeter } from "../components/BudgetMeter";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { DecisionPanel } from "../components/DecisionPanel";
import { LoadProfileChart } from "../components/LoadProfileChart";
import { DetourLayer } from "../components/map/DetourLayer";
import { CandidateMarkers, TruckMarker } from "../components/map/Markers";
import { MapView } from "../components/map/MapView";
import { RouteLayer } from "../components/map/RouteLayer";
import { TimelineBar } from "../components/TimelineBar";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Stamp } from "../components/ui/Stamp";
import { useAcceptCandidate, useRoutes } from "../hooks/useApiData";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatInr, formatKg, formatKm, formatDuration, formatScore } from "../lib/format";
import { eligibilityLabel } from "../lib/verdict";
import { useWorkspace } from "../state/WorkspaceContext";

export function MatchDetailPage() {
  const { id } = useParams();
  const { state, routeChanged } = useWorkspace();
  const routes = useRoutes();
  const accept = useAcceptCandidate();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const match = state.lastMatch;
  const candidate = match?.candidates.find((c) => c.id === id);
  const route = routes.data?.find((r) => r.id === match?.route_id);
  usePageTitle(candidate?.title ?? "Match details");

  if (!match || !candidate) {
    return (
      <Card>
        <EmptyState title="Run a search first" action={<ButtonLink to="/" variant="primary">Go to the workspace</ButtonLink>}>
          This job is not in your latest results. Results are not kept after you search again.
        </EmptyState>
      </Card>
    );
  }

  const canAccept = candidate.eligible === "pass" && !routeChanged && !!route;
  const blockedReason =
    routeChanged
      ? "The route changed after this search. Run the search again before accepting."
      : candidate.eligible === "unknown"
        ? "Some checks could not be verified, so this job cannot be accepted yet."
        : candidate.eligible === "fail"
          ? "This job failed a mandatory check, so it cannot be accepted."
          : null;

  const doAccept = () => {
    if (!route) return;
    accept.mutate(
      {
        run_id: match.run_id,
        candidate_id: candidate.id,
        route_id: match.route_id,
        route_version: match.route_version,
        snapshot: candidate,
        origin: route.origin,
        destination: route.destination,
        route_polyline: route.polyline,
        route_name: route.name,
      },
      { onSuccess: (shipment) => navigate(`/shipments/${shipment.id}`) },
    );
  };

  const worst = Math.max(candidate.pickup_excursion_km ?? 0, candidate.drop_excursion_km ?? 0);

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="stack" style={{ gap: "0.4rem" }}>
          <Link to="/" className="small">
            ← Back to results
          </Link>
          <h1>{candidate.title}</h1>
          <div className="row" style={{ gap: "0.4rem" }}>
            <Stamp verdict={candidate.eligible} label={eligibilityLabel(candidate.eligible)} />
            <span className="badge">{candidate.category_label}</span>
            {candidate.is_bundle && <span className="badge badge--accent">Bundle of {candidate.bundle_size} (counts as 1 job)</span>}
            {candidate.source_type === "synthetic" && <span className="badge badge--demo">Demo listing</span>}
            {candidate.source_type === "manual" && <span className="badge badge--info">Your listing</span>}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack-lg">
          <Card title="Checks" tone={candidate.eligible}>
            <DecisionPanel checks={candidate.checks} />
          </Card>

          <Card title="Why this result">
            <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {candidate.explanation.map((claim, i) => (
                <li key={i} className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                  <ConfidenceBadge tag={claim.tag} />
                  <span>{claim.text}</span>
                </li>
              ))}
            </ul>
            {candidate.model_score == null && (
              <p className="small muted" style={{ marginTop: "0.75rem" }}>
                No trained model is connected yet, so the ranking score ({formatScore(candidate.baseline_score)}) is a simple demo score.
              </p>
            )}
          </Card>

          <Card title="Timing">
            <TimelineBar stops={candidate.timeline} />
          </Card>

          <Card title="Weight on board">
            <LoadProfileChart profile={candidate.load_profile} routeKm={route?.distance_km ?? 1} capacityKg={state.truck.available_payload_kg} />
          </Card>
        </div>

        <div className="stack-lg">
          <Card title="Accept this job">
            <div className="stack">
              {blockedReason && (
                <p className="banner banner--warn" role="status">
                  {blockedReason}
                </p>
              )}
              {accept.isError && (
                <p className="form-error" role="alert">
                  {accept.error instanceof Error ? accept.error.message : "Could not accept this job."}
                </p>
              )}
              {!confirming ? (
                <Button variant="primary" block disabled={!canAccept} onClick={() => setConfirming(true)}>
                  Accept this job
                </Button>
              ) : (
                <div className="stack banner banner--info">
                  <p>
                    <strong>Confirm.</strong> Accepting freezes the route version and the numbers shown here. You can cancel the shipment
                    later. Nothing is booked with a shipper.
                  </p>
                  <div className="row">
                    <Button variant="primary" disabled={accept.isPending} onClick={doAccept}>
                      {accept.isPending ? "Accepting…" : "Yes, accept"}
                    </Button>
                    <Button onClick={() => setConfirming(false)}>Not yet</Button>
                  </div>
                </div>
              )}
              <p className="field__hint">The app recommends; you decide. It never accepts cargo for you.</p>
            </div>
          </Card>

          <Card title="Route impact">
            <dl className="kv">
              <dt>Route</dt>
              <dd>{candidate.route_class === "on_route" ? "On your route" : "Off route"}</dd>
              <dt>Pickup detour (round trip)</dt>
              <dd>{formatKm(candidate.pickup_excursion_km)}</dd>
              <dt>Drop detour (round trip)</dt>
              <dd>{formatKm(candidate.drop_excursion_km)}</dd>
              <dt>Largest single detour</dt>
              <dd>{candidate.pickup_excursion_km == null || candidate.drop_excursion_km == null ? "—" : formatKm(worst)}</dd>
              <dt>Extra distance</dt>
              <dd>{formatKm(candidate.extra_distance_km)}</dd>
              <dt>Extra active time</dt>
              <dd>{formatDuration(candidate.extra_active_minutes)}</dd>
              <dt>Weight</dt>
              <dd>{formatKg(candidate.weight_kg)}</dd>
            </dl>
            {candidate.budget_after && (
              <div className="stack" style={{ marginTop: "1rem" }}>
                <BudgetMeter
                  label="Distance budget this job would use"
                  fraction={candidate.budget_after.distance_used_fraction}
                  detail={`of ${candidate.budget_after.distance_limit_km} km allowed over the trip`}
                />
                <BudgetMeter
                  label="Time budget this job would use"
                  fraction={candidate.budget_after.time_used_fraction}
                  detail={`of ${candidate.budget_after.time_limit_minutes} minutes allowed over the trip`}
                />
              </div>
            )}
          </Card>

          <Card title="Money" actions={<ConfidenceBadge tag="estimate" />}>
            <dl className="kv">
              <dt>Offered payment</dt>
              <dd>{formatInr(candidate.revenue_inr)}</dd>
              <dt>Incremental costs (expected)</dt>
              <dd>{formatInr(candidate.incremental_cost_inr)}</dd>
              <dt>Net, low case</dt>
              <dd>{formatInr(candidate.net_inr.low)}</dd>
              <dt>
                <strong>Net, expected</strong>
              </dt>
              <dd>
                <strong>{formatInr(candidate.net_inr.expected)}</strong>
              </dd>
              <dt>Net, high case</dt>
              <dd>{formatInr(candidate.net_inr.high)}</dd>
            </dl>
            <p className="field__hint" style={{ marginTop: "0.5rem" }}>
              Only costs this job adds are counted (extra fuel, tolls, wear, driver time, loading). Costs you would have had on your
              route anyway are not. The payment is not profit, and none of this is guaranteed.
            </p>
          </Card>

          {route && (
            <Card title="Map">
              <MapView fit={[...route.polyline, candidate.pickup, candidate.drop]} label="Map of this job" height="18rem">
                <RouteLayer polyline={route.polyline} origin={route.origin} destination={route.destination} />
                <CandidateMarkers candidates={[candidate]} selectedId={candidate.id} onSelect={() => undefined} />
                <DetourLayer candidate={candidate} polyline={route.polyline} routeKm={route.distance_km} />
                <TruckMarker place={state.truck.location} />
              </MapView>
              <p className="field__hint" style={{ marginTop: "0.5rem" }}>Detour lines are straight illustrations, not measured roads.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
