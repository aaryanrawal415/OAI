import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextField } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import { readJson, writeJson } from "../lib/storage";

export interface CustomizationRequest {
  id: string;
  account_name: string;
  account_email: string;
  organization: string;
  scope: "company" | "client" | "driver";
  description: string;
  reference_url: string;
  created_at: string;
  status: "pending" | "approved" | "changes_requested" | "rejected";
}

const REQUEST_KEY = "of_customization_requests";
export const REQUEST_RECIPIENT = "optifreight.ai@gmail.com";

export function CustomizationRequestPage() {
  usePageTitle("Customization request");
  const { user } = useAuth();
  const [organization, setOrganization] = useState(user?.organization_id ? `Organization ${user.organization_id}` : "");
  const [scope, setScope] = useState<CustomizationRequest["scope"]>(
    user?.role === "client" || user?.role === "cargo_owner" ? "client" : user?.role === "driver" ? "driver" : "company",
  );
  const [description, setDescription] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (description.trim().length < 20) {
      setError("Describe the required UI changes in at least 20 characters.");
      return;
    }
    const request: CustomizationRequest = {
      id: `ui-${Date.now()}`,
      account_name: user?.name ?? "Unknown",
      account_email: user?.email ?? "",
      organization: organization.trim(),
      scope,
      description: description.trim(),
      reference_url: referenceUrl.trim(),
      created_at: new Date().toISOString(),
      status: "pending",
    };
    writeJson(REQUEST_KEY, [request, ...readJson<CustomizationRequest[]>(REQUEST_KEY, [])]);
    const subject = encodeURIComponent(`UI customization request ${request.id}`);
    const body = encodeURIComponent([
      `Request ID: ${request.id}`,
      `Account: ${request.account_name} (${request.account_email})`,
      `Organization: ${request.organization || "None"}`,
      `Scope: ${request.scope}`,
      `Reference: ${request.reference_url || "None"}`,
      "",
      "Requested changes:",
      request.description,
    ].join("\n"));
    window.location.href = `mailto:${REQUEST_RECIPIENT}?subject=${subject}&body=${body}`;
    setSent(true);
    setError("");
  };

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Customization service</span>
          <h1>Request a UI change</h1>
          <p className="muted">Requests are reviewed before any high-level UI changes are implemented.</p>
        </div>
      </div>
      <Card title="Request details">
        <form className="stack" onSubmit={submit}>
          <TextField label="Organization name" value={organization} onChange={(event) => setOrganization(event.target.value)} />
          <label className="field">
            <span className="field__label">Request scope</span>
            <select className="field__control" value={scope} onChange={(event) => setScope(event.target.value as CustomizationRequest["scope"])}>
              <option value="company">Company interface</option>
              <option value="client">Client interface</option>
              <option value="driver">Driver interface</option>
            </select>
          </label>
          <TextField label="Reference URL or screenshot link" hint="Optional inspiration or existing design reference." value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} />
          <label className="field">
            <span className="field__label">Requested changes</span>
            <textarea
              className="field__control textarea"
              rows={8}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe colors, layout, navigation, branding, screen-level behavior, and priorities."
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {sent && <p className="banner banner--info" role="status">Request saved. Your email application will open with it addressed to {REQUEST_RECIPIENT}.</p>}
          <Button type="submit" variant="ink">Send review request</Button>
        </form>
      </Card>
    </div>
  );
}
