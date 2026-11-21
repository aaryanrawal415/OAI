import { ButtonLink } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { usePageTitle } from "../hooks/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <EmptyState title="Page not found" action={<ButtonLink to="/" variant="primary">Back to the workspace</ButtonLink>}>
          That address does not exist.
        </EmptyState>
      </div>
    </div>
  );
}
