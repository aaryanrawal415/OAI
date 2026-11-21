import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission } from "../auth/permissions";
import { ConfidenceBadge } from "../components/ConfidenceBadge";
import { GoogleMapsButton } from "../components/GoogleMapsButton";
import { EmbedMinimap } from "../components/map/EmbedMinimap";
import { StatusTimeline } from "../components/StatusTimeline";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SelectField } from "../components/ui/Field";
import { SkeletonCards } from "../components/ui/Skeleton";
import {
  useAssignShipment,
  useFleetContainers,
  useFleetDrivers,
  useShipment,
  useShipmentActions,
} from "../hooks/useApiData";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDateTime, formatInr, formatKg, formatKm } from "../lib/format";
import { isActive, nextStatus, STATUS_LABEL } from "../lib/shipment";

export function ShipmentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const query = useShipment(id);
  const actions = useShipmentActions(id ?? "");
  const assign = useAssignShipment();
  const fleetDrivers = useFleetDrivers();
  const fleetContainers = useFleetContainers();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [assignmentContainerId, setAssignmentContainerId] = useState("");
  const shipment = query.data;
  const canManageFleet = hasPermission(user, "fleet:manage");
  usePageTitle(shipment ? `Shipment: ${shipment.candidate.title}` : "Shipment");

  useEffect(() => {
    setAssignmentContainerId(shipment?.fleet_container_id ?? "");
  }, [shipment?.id, shipment?.fleet_container_id]);

  if (query.isLoading) return <SkeletonCards count={2} />;
  if (query.isError || !shipment) {
    return (
      <Card>
        <EmptyState title="Shipment not found" action={<ButtonLink to="/history" variant="primary">See your shipments</ButtonLink>}>
          It may have been removed or belong to another account.
        </EmptyState>
      </Card>
    );
  }

  const c = shipment.candidate;
  const next = nextStatus(shipment.status);
  const active = isActive(shipment.status);
  const error = actions.advance.error ?? actions.cancel.error;
  const assignedDriver = fleetDrivers.data?.find((driver) => driver.id === shipment.assigned_driver_id);
  const assignedContainer = fleetContainers.data?.find((container) => container.id === shipment.fleet_container_id);
  const availableContainers = (fleetContainers.data ?? []).filter((container) => container.driver_id);

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="stack" style={{ gap: "0.4rem" }}>
          <Link to="/history" className="small">
            ← All shipments
          </Link>
          <h1>{c.title}</h1>
          <div className="row" style={{ gap: "0.4rem" }}>
            <span className={`badge ${shipment.status === "cancelled" ? "" : "badge--info"}`}>{STATUS_LABEL[shipment.status]}</span>
            <span className="badge">{shipment.route_name}, route version {shipment.route_version}</span>
            {c.source_type === "synthetic" && <span className="badge badge--demo">Demo listing</span>}
          </div>
        </div>
        <ButtonLink to={`/shipments/${shipment.id}/sheet`}>Printable trip sheet</ButtonLink>
      </div>

      <div className="detail-grid">
        <div className="stack-lg">
          <Card title="Route">
            <div className="stack">
              <EmbedMinimap origin={shipment.origin} destination={shipment.destination} polyline={shipment.route_polyline} pickup={c.pickup} drop={c.drop} />
              <GoogleMapsButton origin={shipment.origin} destination={shipment.destination} waypoints={[c.pickup, c.drop]} />
            </div>
          </Card>

          <Card title="Stops">
            <ol className="stack" style={{ margin: 0, paddingLeft: "1.2rem" }}>
              <li>
                <strong>Pickup:</strong> {c.pickup.name}
                <span className="muted small"> · detour {formatKm(c.pickup_excursion_km)} round trip</span>
              </li>
              <li>
                <strong>Drop:</strong> {c.drop.name}
                <span className="muted small"> · detour {formatKm(c.drop_excursion_km)} round trip</span>
              </li>
              <li>
                <strong>Then continue to:</strong> {shipment.destination.name} (your original route)
              </li>
            </ol>
          </Card>
        </div>

        <div className="stack-lg">
          {canManageFleet && (
            <Card title="Fleet assignment">
              <div className="stack">
                {shipment.assigned_driver_id ? (
                  <p>
                    Assigned to <strong>{assignedDriver?.name ?? "Driver"}</strong>
                    {assignedContainer ? ` · container ${assignedContainer.registration_number}` : ""}.
                  </p>
                ) : (
                  <p className="muted">This accepted offer has not been assigned to a driver yet.</p>
                )}
                {availableContainers.length > 0 ? (
                  <>
                    <SelectField
                      label="Driver and container"
                      value={assignmentContainerId}
                      onChange={(event) => setAssignmentContainerId(event.target.value)}
                    >
                      <option value="">Select an assigned container</option>
                      {availableContainers.map((container) => (
                        <option key={container.id} value={container.id}>
                          {container.registration_number} · {fleetDrivers.data?.find((driver) => driver.id === container.driver_id)?.name ?? "Driver"}
                        </option>
                      ))}
                    </SelectField>
                    <Button
                      variant="primary"
                      disabled={!assignmentContainerId || assign.isPending || !active}
                      onClick={() => {
                        const container = availableContainers.find((item) => item.id === assignmentContainerId);
                        if (container?.driver_id) {
                          assign.mutate({
                            id: shipment.id,
                            assignment: { driver_id: container.driver_id, container_id: container.id },
                          });
                        }
                      }}
                    >
                      {assign.isPending ? "Assigning…" : "Assign offer"}
                    </Button>
                  </>
                ) : (
                  <p className="banner banner--info">
                    Add a driver and assign a container to them before assigning this offer.{" "}
                    <Link to="/fleet">Manage your fleet</Link>.
                  </p>
                )}
                {shipment.assigned_driver_id && (
                  <Button
                    variant="ghost"
                    disabled={assign.isPending || !active}
                    onClick={() => assign.mutate({
                      id: shipment.id,
                      assignment: { driver_id: null, container_id: null },
                    })}
                  >
                    Clear assignment
                  </Button>
                )}
                {assign.isError && (
                  <p className="form-error" role="alert">
                    {assign.error instanceof Error ? assign.error.message : "Could not assign this offer."}
                  </p>
                )}
              </div>
            </Card>
          )}
          <Card title="Progress">
            <div className="stack">
              <StatusTimeline status={shipment.status} history={shipment.status_history} />
              <p className="field__hint">Progress is moved by you, step by step. There is no GPS tracking.</p>
              {error && (
                <p className="form-error" role="alert">
                  {error instanceof Error ? error.message : "That did not work."}
                </p>
              )}
              {active && (
                <div className="stack">
                  {next && (
                    <Button variant="primary" block disabled={actions.advance.isPending} onClick={() => actions.advance.mutate()}>
                      {actions.advance.isPending ? "Updating…" : `Move to: ${STATUS_LABEL[next]}`}
                    </Button>
                  )}
                  {!confirmCancel ? (
                    <Button variant="danger" block onClick={() => setConfirmCancel(true)}>
                      Cancel and release this job
                    </Button>
                  ) : (
                    <div className="banner banner--warn stack">
                      <p>
                        <strong>Cancel this shipment?</strong> It stops counting toward your trip's job limit.
                      </p>
                      <div className="row">
                        <Button variant="danger" disabled={actions.cancel.isPending} onClick={() => actions.cancel.mutate(undefined, { onSuccess: () => setConfirmCancel(false) })}>
                          Yes, cancel it
                        </Button>
                        <Button onClick={() => setConfirmCancel(false)}>Keep it</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="Figures frozen at acceptance" actions={<ConfidenceBadge tag="estimate" />}>
            <dl className="kv">
              <dt>Accepted</dt>
              <dd>{formatDateTime(shipment.created_at)}</dd>
              <dt>Cargo</dt>
              <dd>{c.category_label}</dd>
              <dt>Weight</dt>
              <dd>{formatKg(c.weight_kg)}</dd>
              <dt>Offered payment</dt>
              <dd>{formatInr(c.revenue_inr)}</dd>
              <dt>Estimated net</dt>
              <dd>{formatInr(c.net_inr.expected)}</dd>
              <dt>Extra distance</dt>
              <dd>{formatKm(c.extra_distance_km)}</dd>
            </dl>
            <p className="field__hint" style={{ marginTop: "0.5rem" }}>
              These are the numbers you saw when you accepted. They do not change if the search is run again.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
