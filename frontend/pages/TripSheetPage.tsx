import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { QrCode } from "../components/QrCode";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCards } from "../components/ui/Skeleton";
import { useShipment } from "../hooks/useApiData";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDateTime, formatInr, formatKg, formatKm } from "../lib/format";
import { googleMapsDirectionsUrl } from "../lib/googleMapsUrl";
import { STATUS_LABEL } from "../lib/shipment";

/** One printable page: stops, figures, and a QR code that opens the trip in Google Maps. */
export function TripSheetPage() {
  const { id } = useParams();
  const query = useShipment(id);
  const shipment = query.data;
  usePageTitle("Trip sheet");

  if (query.isLoading) return <SkeletonCards count={1} />;
  if (!shipment) {
    return (
      <Card>
        <EmptyState title="Shipment not found" />
      </Card>
    );
  }

  const c = shipment.candidate;
  const url = googleMapsDirectionsUrl({ origin: shipment.origin, destination: shipment.destination, waypoints: [c.pickup, c.drop] });
  const blank = "______________________________";

  return (
    <div className="stack-lg">
      <div className="row-between no-print">
        <Link to={`/shipments/${shipment.id}`}>← Back to the shipment</Link>
        <Button variant="primary" onClick={() => window.print()}>
          Print this sheet
        </Button>
      </div>

      <Card>
        <div className="stack-lg">
          <div className="row-between" style={{ alignItems: "flex-start" }}>
            <div className="stack" style={{ gap: "0.3rem" }}>
              <span className="eyebrow">OptiFreight AI · trip sheet</span>
              <h1>{c.title}</h1>
              <p className="muted">
                {shipment.route_name} · route version {shipment.route_version} · {STATUS_LABEL[shipment.status]}
              </p>
            </div>
            <div className="stack" style={{ alignItems: "center", gap: "0.25rem" }}>
              <QrCode text={url} label="QR code that opens this trip in Google Maps" />
              <span className="small muted">Scan to open in Google Maps</span>
            </div>
          </div>

          {api.mode === "mock" && (
            <p className="banner banner--demo">Demonstration data. This is not a real shipment and carries no legal weight.</p>
          )}

          <table className="table">
            <tbody>
              <tr>
                <th scope="row">Start</th>
                <td>{shipment.origin.name}</td>
              </tr>
              <tr>
                <th scope="row">Pickup</th>
                <td>{c.pickup.name}</td>
              </tr>
              <tr>
                <th scope="row">Drop</th>
                <td>{c.drop.name}</td>
              </tr>
              <tr>
                <th scope="row">Then continue to</th>
                <td>{shipment.destination.name}</td>
              </tr>
              <tr>
                <th scope="row">Cargo</th>
                <td>
                  {c.category_label}, {formatKg(c.weight_kg)}
                  {c.is_bundle ? `, bundle of ${c.bundle_size} consignments` : ""}
                </td>
              </tr>
              <tr>
                <th scope="row">Offered payment</th>
                <td className="mono">{formatInr(c.revenue_inr)}</td>
              </tr>
              <tr>
                <th scope="row">Estimated net (an estimate)</th>
                <td className="mono">{formatInr(c.net_inr.expected)}</td>
              </tr>
              <tr>
                <th scope="row">Extra distance</th>
                <td className="mono">{formatKm(c.extra_distance_km)}</td>
              </tr>
              <tr>
                <th scope="row">Accepted</th>
                <td>{formatDateTime(shipment.created_at)}</td>
              </tr>
            </tbody>
          </table>

          <div className="stack">
            <h2>Fill in by hand</h2>
            <p>Pickup contact and phone: {blank}</p>
            <p>Drop contact and phone: {blank}</p>
            <p>Loading time: {blank} &nbsp; Unloading time: {blank}</p>
            <p>Driver signature: {blank}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
