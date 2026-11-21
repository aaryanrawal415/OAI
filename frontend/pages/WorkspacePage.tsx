import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission } from "../auth/permissions";
import { CandidateMarkers, TruckMarker } from "../components/map/Markers";
import { DetourLayer } from "../components/map/DetourLayer";
import { MapLegend } from "../components/map/MapLegend";
import { MapView } from "../components/map/MapView";
import { RouteLayer } from "../components/map/RouteLayer";
import { BudgetMeter } from "../components/BudgetMeter";
import { JobCounter } from "../components/JobCounter";
import { ManualCargoForm } from "../components/ManualCargoForm";
import { OffRouteToggle } from "../components/OffRouteToggle";
import { ResultList } from "../components/ResultList";
import { RoutePicker } from "../components/RoutePicker";
import { TruckForm } from "../components/TruckForm";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCards } from "../components/ui/Skeleton";
import { useFleetContainers, useRoutes, useRunMatching, useShipments, useUpdateFleetContainer } from "../hooks/useApiData";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDateTime } from "../lib/format";
import { istDayKey } from "../lib/datetime";
import { isActive } from "../lib/shipment";
import { truckProblems } from "../lib/validate";
import { useWorkspace } from "../state/WorkspaceContext";
import { SelectField } from "../components/ui/Field";

export function WorkspacePage() {
  usePageTitle("Workspace");
  const { user } = useAuth();
  const { state, dispatch, request, routeChanged, inputsChanged } = useWorkspace();
  const routesQuery = useRoutes();
  const shipments = useShipments();
  const fleetContainers = useFleetContainers();
  const updateFleetContainer = useUpdateFleetContainer();
  const run = useRunMatching();
  const [pickMode, setPickMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const route = routesQuery.data?.find((r) => r.id === state.routeId);
  const selectedFleetContainer = fleetContainers.data?.find((container) => container.id === state.selectedFleetContainerId);
  const match = state.lastMatch && state.lastMatch.route_id === state.routeId ? state.lastMatch : null;
  const problems = truckProblems(state.truck);
  const canSearch = problems.length === 0 && !!route && !run.isPending;
  const selected = match?.candidates.find((c) => c.id === selectedId) ?? null;
  const canManageFleet = hasPermission(user, "fleet:manage");

  useEffect(() => {
    if (
      fleetContainers.data
      && state.selectedFleetContainerId
      && !fleetContainers.data.some((container) => container.id === state.selectedFleetContainerId)
    ) {
      dispatch({ type: "selectFleetContainer", containerId: null, truck: null });
    }
  }, [dispatch, fleetContainers.data, state.selectedFleetContainerId]);

  // Jobs and budget already used by accepted shipments on this route
  const active = useMemo(
    () => (shipments.data ?? []).filter((s) => s.route_id === state.routeId && isActive(s.status)),
    [shipments.data, state.routeId],
  );
  const today = istDayKey(new Date().toISOString());
  const usedToday = active.filter((s) => istDayKey(s.created_at) === today).length;
  const fraction = (pick: (s: (typeof active)[number]) => number | null, limit: number | undefined): number | null => {
    if (!limit) return null;
    let total = 0;
    for (const s of active) {
      const value = pick(s);
      if (value == null) return null; // an unknown amount is never counted as zero
      total += value;
    }
    return total / limit;
  };

  const fitPoints = useMemo(() => (route ? [...route.polyline, state.truck.location] : []), [route, state.truck.location]);

  const search = () =>
    run.mutate(request, {
      onSuccess: (result) => setSelectedId(result.candidates.find((c) => c.eligible === "pass")?.id ?? null),
    });

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>Find cargo for your onward trip</h1>
        </div>
      </div>

      <div className="workspace">
        {/* ---------------- left: inputs ---------------- */}
        <div className="workspace__col">
          <Card title="Your truck">
            {canManageFleet && (
              <SelectField
                label="Fleet container"
                value={selectedFleetContainer ? selectedFleetContainer.id : ""}
                onChange={(event) => {
                  const container = fleetContainers.data?.find((item) => item.id === event.target.value);
                  dispatch({
                    type: "selectFleetContainer",
                    containerId: container?.id ?? null,
                    truck: container?.truck ?? null,
                  });
                }}
              >
                <option value="">Custom truck setup</option>
                {(fleetContainers.data ?? []).map((container) => (
                  <option key={container.id} value={container.id}>{container.registration_number}</option>
                ))}
              </SelectField>
            )}
            <TruckForm pickMode={pickMode} onTogglePick={() => setPickMode((v) => !v)} routeOrigin={route?.origin} />
            {canManageFleet && selectedFleetContainer && (
              <div className="stack">
                <Button
                  small
                  disabled={updateFleetContainer.isPending}
                  onClick={() => updateFleetContainer.mutate({
                    id: selectedFleetContainer.id,
                    input: {
                      registration_number: selectedFleetContainer.registration_number,
                      truck: state.truck,
                      driver_id: selectedFleetContainer.driver_id,
                    },
                  })}
                >
                  {updateFleetContainer.isPending ? "Saving…" : "Save container specifications"}
                </Button>
                {updateFleetContainer.isError && (
                  <p className="form-error" role="alert">
                    {updateFleetContainer.error instanceof Error ? updateFleetContainer.error.message : "Could not save container specifications."}
                  </p>
                )}
              </div>
            )}
          </Card>
          <Card title="Your route">
            {routesQuery.isLoading && <SkeletonCards count={1} />}
            {routesQuery.isError && <p className="form-error" role="alert">Could not load routes.</p>}
            {routesQuery.data && <RoutePicker routes={routesQuery.data} bandLabel={match?.caps.band_label ?? null} />}
          </Card>
          <Card title="Search">
            <div className="stack">
              <OffRouteToggle checked={state.offRoute} onChange={(value) => dispatch({ type: "setOffRoute", value })} />
              {problems.length > 0 && (
                <ul className="form-error" role="alert" style={{ margin: 0, paddingLeft: "1.2rem" }}>
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              <Button variant="primary" block disabled={!canSearch} onClick={search}>
                {run.isPending ? "Searching…" : match ? "Search again" : "Find cargo"}
              </Button>
            </div>
          </Card>
          {match && (
            <Card title="Trip limits">
              <div className="stack">
                <JobCounter used={active.length} max={match.caps.max_jobs_total} perDay={match.caps.max_jobs_per_day} usedToday={usedToday} />
                <BudgetMeter
                  label="Extra distance budget"
                  fraction={fraction((s) => s.candidate.extra_distance_km, match.budget.distance_limit_km)}
                  detail={`Up to ${match.budget.distance_limit_km} km extra over the whole trip.`}
                />
                <BudgetMeter
                  label="Extra active time budget"
                  fraction={fraction((s) => s.candidate.extra_active_minutes, match.budget.time_limit_minutes)}
                  detail={`Up to ${match.budget.time_limit_minutes} minutes of extra driving, loading, unloading and waiting.`}
                />
                <p className="field__hint">Based on jobs you have accepted on this route.</p>
              </div>
            </Card>
          )}
          <Card title="Add your own listing">
            <details>
              <summary style={{ cursor: "pointer", fontWeight: 500 }}>Enter a load manually</summary>
              <div style={{ marginTop: "0.75rem" }}>
                <ManualCargoForm />
              </div>
            </details>
          </Card>
        </div>

        {/* ---------------- centre: map ---------------- */}
        <div className="workspace__col workspace__map">
          <Card title="Map">
            <div className="stack">
              {pickMode && (
                <p className="banner banner--info" role="status">
                  Click the map to place your truck. <Button small variant="ghost" onClick={() => setPickMode(false)}>Cancel</Button>
                </p>
              )}
              {route ? (
                <MapView
                  fit={fitPoints}
                  label="Map of your route, truck, and candidate cargo"
                  height="32rem"
                  onPick={
                    pickMode
                      ? (point) => {
                          dispatch({ type: "setLocation", place: { name: "Selected location", ...point } });
                          setPickMode(false);
                        }
                      : undefined
                  }
                >
                  <RouteLayer polyline={route.polyline} origin={route.origin} destination={route.destination} />
                  {match && !routeChanged && (
                    <CandidateMarkers candidates={match.candidates} selectedId={selectedId} onSelect={setSelectedId} />
                  )}
                  {selected && !routeChanged && <DetourLayer candidate={selected} polyline={route.polyline} routeKm={route.distance_km} />}
                  <TruckMarker place={state.truck.location} />
                </MapView>
              ) : (
                <SkeletonCards count={1} />
              )}
              <MapLegend />
              <p className="field__hint">Route lines are drawn through rough waypoints, not along real roads.</p>
            </div>
          </Card>
        </div>

        {/* ---------------- right: results ---------------- */}
        <div className="workspace__col workspace__results">
          <Card
            title="Results"
            actions={match ? <span className="small muted">Searched {formatDateTime(match.generated_at)}</span> : undefined}
          >
            <div className="stack">
              {match && (
                <div className="row" style={{ gap: "0.4rem" }}>
                  <span className="badge badge--demo">{match.data_label === "live" ? "Live data" : match.data_label === "mixed" ? "Demo + your listings" : "Demonstration data"}</span>
                  <span className="badge">Routing: {match.routing_source === "mock" ? "not measured (demo)" : match.routing_source}</span>
                  <span className="badge">Off-route stops: {match.off_route_enabled ? "on" : "off"}</span>
                </div>
              )}
              {routeChanged && (
                <p className="banner banner--warn" role="alert">
                  <strong>The route changed after this search.</strong> These results are out of date. Run the search again.
                </p>
              )}
              {!routeChanged && inputsChanged && match && (
                <p className="banner banner--info" role="status">
                  Your truck or settings changed since this search. Run it again to update the results.
                </p>
              )}
              {run.isError && (
                <p className="form-error" role="alert">
                  {run.error instanceof Error ? run.error.message : "The search failed."}
                </p>
              )}
              {run.isPending && <SkeletonCards count={3} />}
              {!run.isPending && !match && (
                <EmptyState title="No search yet">
                  Set your truck and route, then choose Find cargo. Every result shows why it passed or failed.
                </EmptyState>
              )}
              {!run.isPending && match && (
                <div style={routeChanged ? { opacity: 0.55 } : undefined} aria-busy={routeChanged}>
                  <ResultList
                    candidates={match.candidates}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    compareIds={state.compareIds}
                    onToggleCompare={(id) => dispatch({ type: "toggleCompare", id })}
                  />
                </div>
              )}
              {match && match.notices.length > 0 && (
                <ul className="small muted" style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {match.notices.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
