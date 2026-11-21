import { useState } from "react";
import { Link } from "react-router-dom";
import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SelectField } from "../components/ui/Field";
import { SkeletonCards } from "../components/ui/Skeleton";
import { useShipments } from "../hooks/useApiData";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatDateTime, formatInr, formatKm } from "../lib/format";
import { STATUS_LABEL } from "../lib/shipment";

export function HistoryPage() {
  usePageTitle("Shipments");
  const query = useShipments();
  const [filter, setFilter] = useState("all");
  const all = query.data ?? [];
  const shown = all.filter((s) => (filter === "all" ? true : filter === "active" ? s.status !== "delivered" && s.status !== "cancelled" : s.status === filter));

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Shipments</span>
          <h1>Jobs you accepted</h1>
        </div>
        <div style={{ minWidth: "12rem" }}>
          <SelectField label="Show" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">In progress</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </SelectField>
        </div>
      </div>

      {query.isLoading && <SkeletonCards count={2} />}
      {query.isError && (
        <p className="form-error" role="alert">
          Could not load your shipments.
        </p>
      )}
      {!query.isLoading && all.length === 0 && (
        <Card>
          <EmptyState title="No accepted jobs yet" action={<ButtonLink to="/" variant="primary">Find cargo</ButtonLink>}>
            Jobs you accept from the workspace appear here with their status.
          </EmptyState>
        </Card>
      )}
      {all.length > 0 && (
        <Card>
          {shown.length === 0 ? (
            <EmptyState title="Nothing matches this filter" />
          ) : (
            <div className="table-scroll">
              <table className="table">
                <caption className="sr-only">Accepted shipments</caption>
                <thead>
                  <tr>
                    <th scope="col">Job</th>
                    <th scope="col">Route</th>
                    <th scope="col">Status</th>
                    <th scope="col">Accepted</th>
                    <th scope="col">Estimated net</th>
                    <th scope="col">Extra distance</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/shipments/${s.id}`}>{s.candidate.title}</Link>
                      </td>
                      <td>{s.route_name}</td>
                      <td>{STATUS_LABEL[s.status]}</td>
                      <td>{formatDateTime(s.created_at)}</td>
                      <td className="mono">{formatInr(s.candidate.net_inr.expected)}</td>
                      <td className="mono">{formatKm(s.candidate.extra_distance_km)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
