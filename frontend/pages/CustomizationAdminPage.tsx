import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";
import { readJson, writeJson } from "../lib/storage";
import type { CustomizationRequest } from "./CustomizationRequestPage";

const REQUEST_KEY = "of_customization_requests";

export function CustomizationAdminPage() {
  usePageTitle("Customization requests");
  const [requests, setRequests] = useState<CustomizationRequest[]>(() => readJson<CustomizationRequest[]>(REQUEST_KEY, []));

  const update = (id: string, status: CustomizationRequest["status"]) => {
    const next = requests.map((request) => request.id === id ? { ...request, status } : request);
    setRequests(next);
    writeJson(REQUEST_KEY, next);
  };

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Platform administration</span>
          <h1>UI customization review</h1>
        </div>
      </div>
      <Card title="Request queue">
        {requests.length === 0 ? (
          <p className="muted">No customization requests have been submitted.</p>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr><th>Request</th><th>Account</th><th>Scope</th><th>Details</th><th>Status</th><th>Review</th></tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}<br /><span className="small muted">{new Date(request.created_at).toLocaleString()}</span></td>
                    <td>{request.account_name}<br /><span className="small">{request.account_email}</span></td>
                    <td>{request.scope}</td>
                    <td>{request.description}<br />{request.reference_url && <a href={request.reference_url} target="_blank" rel="noreferrer">Reference</a>}</td>
                    <td><span className={`badge ${request.status === "approved" ? "badge--info" : "badge--demo"}`}>{request.status.replace("_", " ")}</span></td>
                    <td>
                      <div className="row">
                        <Button small onClick={() => update(request.id, "approved")}>Approve</Button>
                        <Button small onClick={() => update(request.id, "changes_requested")}>Changes</Button>
                        <Button small variant="danger" onClick={() => update(request.id, "rejected")}>Reject</Button>
                      </div>
                    </td>
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
