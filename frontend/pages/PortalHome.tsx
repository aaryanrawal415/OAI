import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function PortalHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "client") return <Navigate to="/client/jobs" replace />;
  if (user.role === "driver") return <Navigate to="/deliveries" replace />;
  if (user.role === "organization_owner" || user.role === "cargo_owner") return <Navigate to="/fleet" replace />;
  if (["organization_staff", "organization_manager", "platform_admin", "admin"].includes(user.role)) {
    return <Navigate to="/organization" replace />;
  }
  return <Navigate to="/workspace" replace />;
}
