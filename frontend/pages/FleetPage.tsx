import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, Tooltip } from "react-leaflet";
import type { FleetContainer } from "../api/types";
import { useAuth } from "../auth/AuthProvider";
import { MapView } from "../components/map/MapView";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SelectField, TextField } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  useAddFleetContainer,
  useAddFleetDriver,
  useDeleteFleetContainer,
  useDeleteFleetDriver,
  useFleetContainers,
  useFleetDrivers,
  useShipments,
  useUpdateFleetContainer,
} from "../hooks/useApiData";
import { isActive, STATUS_LABEL } from "../lib/shipment";
import { useWorkspace } from "../state/WorkspaceContext";

function errorText(error: unknown): string | null {
  return error instanceof Error ? error.message : error ? "The request failed." : null;
}

function ContainerCard({
  container,
  drivers,
  onAssign,
  onDelete,
  busy,
}: {
  container: FleetContainer;
  drivers: { id: string; name: string }[];
  onAssign: (driverId: string | null) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <article className="card stack">
      <div className="row-between">
        <div>
          <h3>{container.registration_number}</h3>
          <p className="small muted">
            {container.truck.vehicle_class} · {container.truck.body_type} ·{" "}
            {container.truck.max_payload_kg.toLocaleString("en-IN")} kg max payload
          </p>
        </div>
        <Button small variant="danger" disabled={busy} onClick={onDelete}>Remove</Button>
      </div>
      <SelectField
        label={`Driver for ${container.registration_number}`}
        value={container.driver_id ?? ""}
        onChange={(event) => onAssign(event.target.value || null)}
      >
        <option value="">No driver assigned</option>
        {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
      </SelectField>
    </article>
  );
}

export function FleetPage() {
  usePageTitle("Organization fleet");
  const { user } = useAuth();
  const { state } = useWorkspace();
  const driversQuery = useFleetDrivers();
  const containersQuery = useFleetContainers();
  const shipmentsQuery = useShipments();
  const addDriver = useAddFleetDriver();
  const deleteDriver = useDeleteFleetDriver();
  const addContainer = useAddFleetContainer();
  const updateContainer = useUpdateFleetContainer();
  const deleteContainer = useDeleteFleetContainer();
  const drivers = driversQuery.data ?? [];
  const containers = containersQuery.data ?? [];
  const shipments = shipmentsQuery.data ?? [];
  const activeShipments = shipments.filter((shipment) => isActive(shipment.status));
  const unassignedShipments = activeShipments.filter((shipment) => !shipment.assigned_driver_id);

  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [containerDriver, setContainerDriver] = useState("");

  const submitDriver = (event: FormEvent) => {
    event.preventDefault();
    addDriver.mutate(
      { name: driverName, email: driverEmail },
      { onSuccess: () => { setDriverName(""); setDriverEmail(""); } },
    );
  };

  const submitContainer = (event: FormEvent) => {
    event.preventDefault();
    addContainer.mutate(
      {
        registration_number: registrationNumber,
        truck: state.truck,
        driver_id: containerDriver || null,
      },
      { onSuccess: () => { setRegistrationNumber(""); setContainerDriver(""); } },
    );
  };

  const updateDriver = (container: FleetContainer, driverId: string | null) => {
    updateContainer.mutate({
      id: container.id,
      input: { registration_number: container.registration_number, truck: container.truck, driver_id: driverId },
    });
  };

  const assignmentFor = (shipmentId: string) => {
    const shipment = shipments.find((item) => item.id === shipmentId);
    if (!shipment?.assigned_driver_id) return "Unassigned";
    const driver = drivers.find((item) => item.id === shipment.assigned_driver_id);
    const container = containers.find((item) => item.id === shipment.fleet_container_id);
    return `${driver?.name ?? "Driver"} · ${container?.registration_number ?? "Container"}`;
  };

  return (
    <div className="fleet-page stack-lg">
      <section className="fleet-hero" aria-labelledby="fleet-heading">
        <div className="fleet-hero__intro">
          <span className="badge badge--info">Organization owner</span>
          <h1 id="fleet-heading">{user?.organization_name ?? "Fleet operations"}</h1>
          <p>One place to manage drivers, containers, and accepted offers across your organization.</p>
          <ButtonLink to="/workspace" variant="primary">Find client offers</ButtonLink>
        </div>
        <dl className="fleet-stats" aria-label="Fleet overview">
          <div><dt>Drivers</dt><dd>{drivers.length}</dd></div>
          <div><dt>Containers</dt><dd>{containers.length}</dd></div>
          <div><dt>Active offers</dt><dd>{activeShipments.length}</dd></div>
          <div><dt>Need assignment</dt><dd>{unassignedShipments.length}</dd></div>
        </dl>
      </section>

      <p className="field__hint">
        Fleet assignments are managed here; live vehicle location and telemetry are not connected.
      </p>

      <div className="detail-grid">
        <Card title="Drivers">
          <div className="stack">
            <form className="stack" onSubmit={submitDriver}>
              <TextField label="Driver name" value={driverName} onChange={(event) => setDriverName(event.target.value)} />
              <TextField label="Driver email" type="email" value={driverEmail} onChange={(event) => setDriverEmail(event.target.value)} />
              {errorText(addDriver.error) && <p className="form-error" role="alert">{errorText(addDriver.error)}</p>}
              <Button type="submit" variant="primary" disabled={addDriver.isPending}>
                {addDriver.isPending ? "Adding…" : "Add driver"}
              </Button>
            </form>
            <p className="field__hint">This adds a fleet roster record; driver login invitations are not configured in this workspace.</p>
            {driversQuery.isError && <p className="form-error" role="alert">Could not load drivers: {errorText(driversQuery.error)}</p>}
            {drivers.length === 0 && !driversQuery.isLoading ? (
              <EmptyState title="No drivers yet">Add drivers to assign containers and accepted offers.</EmptyState>
            ) : (
              <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
                {drivers.map((driver) => (
                  <li className="row-between" key={driver.id}>
                    <span><strong>{driver.name}</strong><br /><span className="small muted">{driver.email}</span></span>
                    <Button
                      small
                      variant="danger"
                      disabled={deleteDriver.isPending}
                      onClick={() => deleteDriver.mutate(driver.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {errorText(deleteDriver.error) && <p className="form-error" role="alert">{errorText(deleteDriver.error)}</p>}
          </div>
        </Card>

        <Card title="Containers">
          <div className="stack">
            <p className="small muted">
              New containers use the truck specifications currently configured in Cargo matching.{" "}
              <Link to="/workspace">Review truck specifications</Link>.
            </p>
            <p className="small">
              <a href="https://ldb.co.in/ldb/containersearch" target="_blank" rel="noopener noreferrer">
                Search or track a container with LDB
              </a>
            </p>
            <form className="stack" onSubmit={submitContainer}>
              <TextField
                label="Container registration"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
              />
              <SelectField label="Assigned driver" value={containerDriver} onChange={(event) => setContainerDriver(event.target.value)}>
                <option value="">No driver assigned</option>
                {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
              </SelectField>
              {errorText(addContainer.error) && <p className="form-error" role="alert">{errorText(addContainer.error)}</p>}
              <Button type="submit" variant="primary" disabled={addContainer.isPending}>
                {addContainer.isPending ? "Adding…" : "Register container"}
              </Button>
            </form>
            {containersQuery.isError && <p className="form-error" role="alert">Could not load containers: {errorText(containersQuery.error)}</p>}
            {containers.length === 0 && !containersQuery.isLoading ? (
              <EmptyState title="No containers yet">Register a container to use its specifications when matching offers.</EmptyState>
            ) : (
              <div className="stack">
                {containers.map((container) => (
                  <ContainerCard
                    key={container.id}
                    container={container}
                    drivers={drivers}
                    busy={updateContainer.isPending || deleteContainer.isPending}
                    onAssign={(driverId) => updateDriver(container, driverId)}
                    onDelete={() => deleteContainer.mutate(container.id)}
                  />
                ))}
              </div>
            )}
            {errorText(updateContainer.error) && <p className="form-error" role="alert">{errorText(updateContainer.error)}</p>}
            {errorText(deleteContainer.error) && <p className="form-error" role="alert">{errorText(deleteContainer.error)}</p>}
          </div>
        </Card>
      </div>

      {containers.length > 0 && (
        <Card title="Fleet location overview">
          <div className="stack">
            <MapView
              fit={containers.map((container) => container.truck.location)}
              label="Saved fleet container locations"
              height="24rem"
            >
              {containers.map((container) => (
                <CircleMarker
                  key={container.id}
                  center={[container.truck.location.lat, container.truck.location.lng]}
                  radius={8}
                  pathOptions={{ color: "#ffffff", fillColor: "#167d80", fillOpacity: 1, weight: 3 }}
                >
                  <Tooltip>
                    {container.registration_number}
                    {container.driver_id
                      ? ` · ${drivers.find((driver) => driver.id === container.driver_id)?.name ?? "Assigned driver"}`
                      : " · Unassigned"}
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapView>
            <p className="field__hint">Map positions are saved truck locations, not live tracking data.</p>
          </div>
        </Card>
      )}

      <Card title="Accepted offers">
        {shipmentsQuery.isError && <p className="form-error" role="alert">Could not load accepted offers: {errorText(shipmentsQuery.error)}</p>}
        {shipments.length === 0 ? (
          <EmptyState title="No accepted offers yet">
            Search client offers and accept a suitable job. You can assign it to a driver and container from the shipment page.
          </EmptyState>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <caption className="sr-only">Accepted offers and fleet assignments</caption>
              <thead>
                <tr><th scope="col">Offer</th><th scope="col">Status</th><th scope="col">Assignment</th><th scope="col">Route</th></tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td><Link to={`/shipments/${shipment.id}`}>{shipment.candidate.title}</Link></td>
                    <td>{STATUS_LABEL[shipment.status]}</td>
                    <td>{assignmentFor(shipment.id)}</td>
                    <td>{shipment.route_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
