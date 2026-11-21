import { Navigate } from "react-router-dom";
import { api } from "../api/client";
import { canAccessAdminProfile, ADMIN_PROFILE_EMAIL } from "../auth/permissions";
import { useAuth } from "../auth/AuthProvider";
import { Card } from "../components/ui/Card";
import { SkeletonCards } from "../components/ui/Skeleton";
import { useAdminProfile } from "../hooks/useApiData";
import { usePageTitle } from "../hooks/usePageTitle";

export function AdminProfilePage() {
  usePageTitle("Administrator profile");
  const { user } = useAuth();
  const profile = useAdminProfile();

  if (!canAccessAdminProfile(user, api.mode === "http")) return <Navigate to="/" replace />;
  if (!user) return null;
  if (profile.isLoading) return <SkeletonCards count={1} />;
  if (profile.isError || !profile.data) {
    return (
      <Card>
        <p className="form-error" role="alert">
          {profile.error instanceof Error ? profile.error.message : "The server could not verify this administrator profile."}
        </p>
      </Card>
    );
  }

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Private</span>
          <h1>Administrator profile</h1>
        </div>
      </div>
      <Card title="Administrator account">
        <dl className="kv profile-details">
          <dt>Name</dt>
          <dd>{profile.data.name}</dd>
          <dt>Verified email</dt>
          <dd>{profile.data.email}</dd>
          <dt>Account ID</dt>
          <dd>{profile.data.id}</dd>
          <dt>Access</dt>
          <dd>Platform administrator</dd>
        </dl>
        <p className="banner banner--warn" role="note">
          The server must authorize this response only for the platform-admin role and allow-listed email ({ADMIN_PROFILE_EMAIL}).
        </p>
      </Card>
    </div>
  );
}
