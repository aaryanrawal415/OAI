import type { RouteInfo } from "../api/types";
import { formatDuration, formatKm } from "../lib/format";
import { useWorkspace } from "../state/WorkspaceContext";
import { Button } from "./ui/Button";
import { SelectField } from "./ui/Field";

interface Props {
  routes: RouteInfo[];
  bandLabel: string | null;
}

export function RoutePicker({ routes, bandLabel }: Props) {
  const { state, dispatch, routeVersion } = useWorkspace();
  const route = routes.find((r) => r.id === state.routeId);

  return (
    <div className="stack">
      <SelectField
        label="Onward route (fixed baseline)"
        value={state.routeId}
        onChange={(e) => {
          const next = routes.find((r) => r.id === e.target.value);
          if (next) dispatch({ type: "setRoute", routeId: next.id, origin: next.origin });
        }}
      >
        {routes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </SelectField>

      {route && (
        <dl className="kv">
          <dt>Length</dt>
          <dd>{formatKm(route.distance_km, 0)}</dd>
          <dt>Driving time</dt>
          <dd>{formatDuration(route.baseline_driving_minutes)}</dd>
          <dt>Job limit band</dt>
          <dd>{bandLabel ?? "after a search"}</dd>
          <dt>Route version</dt>
          <dd>{routeVersion}</dd>
        </dl>
      )}
      {route && !route.verified && (
        <p className="small muted">
          <span className="badge badge--demo">Approximate</span> This length is not measured by a routing engine yet.
        </p>
      )}
      <div className="row">
        <Button
          small
          onClick={() => dispatch({ type: "bumpRouteVersion", routeId: state.routeId })}
          title="Pretend the route changed, to see earlier results marked out of date"
        >
          Simulate a route change
        </Button>
      </div>
    </div>
  );
}
