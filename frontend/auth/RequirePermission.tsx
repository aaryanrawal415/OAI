import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { hasPermission, type Permission } from "./permissions";

export function RequirePermission({ permission }: { permission: Permission }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!hasPermission(user, permission)) return <Navigate to="/" replace />;
  return <Outlet />;
}
