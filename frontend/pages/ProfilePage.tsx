import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";

export function ProfilePage() {
  usePageTitle("Profile");
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Your profile</h1>
        </div>
      </div>

      <div className="detail-grid">
        <Card title="Profile details">
          <div className="profile-summary">
            <div className="profile-avatar" aria-hidden="true">{user.name.trim().slice(0, 1).toUpperCase()}</div>
            <div>
              <h2>{user.name}</h2>
              <p className="muted">{user.email}</p>
            </div>
          </div>
          <dl className="kv profile-details">
            <dt>Account type</dt>
            <dd>{{
              client: "Client",
              cargo_owner: "Owner",
              driver: "Container driver",
              organization_staff: "Organization staff",
              organization_manager: "Organization manager",
              organization_owner: "Owner",
              platform_admin: "Platform administrator",
              admin: "Administrator",
            }[user.role]}</dd>
            <dt>Service tier</dt>
            <dd>{user.tier ? user.tier[0].toUpperCase() + user.tier.slice(1) : "Basic"}</dd>
            <dt>Account ID</dt>
            <dd>{user.id}</dd>
            {user.organization_name && (
              <>
                <dt>Organization</dt>
                <dd>{user.organization_name}</dd>
              </>
            )}
            <dt>Sign-in status</dt>
            <dd><span className="badge badge--info">Signed in</span></dd>
          </dl>
          <p className="field__hint">Profile details are managed by your account provider. Contact your administrator to change them.</p>
        </Card>

        <Card title="Identity verification">
          <p><span className="badge badge--demo">Not verified</span></p>
          <p className="muted">
            Your account is signed in, but government identity verification is not configured for this workspace.
          </p>
          <div className="banner banner--warn" role="note">
            No identity documents have been collected or checked. Verification requires a secure identity provider and server-side
            integration.
          </div>
          <p className="small"><Link to="/settings">Review your settings</Link></p>
        </Card>
      </div>
    </div>
  );
}
