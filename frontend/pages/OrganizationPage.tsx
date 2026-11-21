import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";

export function OrganizationPage() {
  usePageTitle("Organization");
  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Organization portal</span>
          <h1>Operations overview</h1>
        </div>
      </div>
      <div className="detail-grid">
        <Card title="Delivery operations">
          <p className="muted">Monitor active assignments, job status, exceptions, and delivery verification.</p>
          <span className="badge badge--info">Role-controlled access</span>
        </Card>
        <Card title="Tier and privacy">
          <dl className="kv">
            <dt>Organization service</dt>
            <dd>Professional</dd>
            <dt>Identity checks</dt>
            <dd>Required for staff actions</dd>
            <dt>Evidence retention</dt>
            <dd>Server-controlled</dd>
          </dl>
        </Card>
      </div>
    </div>
  );
}
