import { ManualCargoForm } from "../components/ManualCargoForm";
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";

export function ClientJobsPage() {
  usePageTitle("My jobs");
  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Client portal</span>
          <h1>Jobs and cargo</h1>
        </div>
      </div>
      <Card title="Add and manage cargo jobs">
        <ManualCargoForm />
      </Card>
      <p className="field__hint">Use the Remove action in your listing table to release a job. Sensitive account and delivery records are not shown here.</p>
    </div>
  );
}
