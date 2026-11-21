import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useBranding } from "../state/BrandingProvider";
import { useTheme } from "../state/ThemeProvider";
import { useWorkspace } from "../state/WorkspaceContext";
import { DemoStrip } from "./DemoBanner";
import { ErrorBoundary } from "./ErrorBoundary";
import { canAccessAdminProfile, hasPermission } from "../auth/permissions";
import { api } from "../api/client";

function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 128 128" aria-hidden="true">
      <rect width="128" height="128" rx="26" fill="#f6f3ec" />
      <path d="M22 84h58V44H22z" fill="none" stroke="#14213d" strokeWidth="7" strokeLinejoin="round" />
      <path d="M80 56h18l12 14v14H80z" fill="none" stroke="#14213d" strokeWidth="7" strokeLinejoin="round" />
      <circle cx="40" cy="90" r="9" fill="#e36414" stroke="#f6f3ec" strokeWidth="4" />
      <circle cx="98" cy="90" r="9" fill="#e36414" stroke="#f6f3ec" strokeWidth="4" />
    </svg>
  );
}

const THEME_LABEL = { system: "Theme: auto", light: "Theme: light", dark: "Theme: dark" } as const;

export function AppShell() {
  const { user, logout } = useAuth();
  const { settings: branding } = useBranding();
  const { state, dispatch } = useWorkspace();
  const { choice, cycle } = useTheme();
  const client = useQueryClient();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    dispatch({ type: "reset" });
    client.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header">
        <div className="header__inner">
          <NavLink to="/" className="brand" aria-label="OptiFreight AI home">
            {branding.logoDataUrl ? (
              <img className="brand__logo" src={branding.logoDataUrl} alt="" />
            ) : (
              <BrandMark />
            )}
            <span>
              {branding.organizationName}
              <span className="brand__sub">{branding.tagline}</span>
            </span>
          </NavLink>
          <nav className="nav" aria-label="Main">
            {hasPermission(user, "jobs:create") && !["organization_staff", "organization_manager", "organization_owner", "platform_admin", "admin"].includes(user?.role ?? "") && (
              <NavLink to="/client/jobs">My jobs</NavLink>
            )}
            {hasPermission(user, "jobs:accept") && (
              <>
                <NavLink to="/workspace">Cargo matching</NavLink>
                <NavLink to="/compare">Compare{state.compareIds.length > 0 && <span className="nav-count">{state.compareIds.length}</span>}</NavLink>
              </>
            )}
            {hasPermission(user, "proof:upload") && <NavLink to="/deliveries">Delivery proof</NavLink>}
            {hasPermission(user, "deliveries:verify") && <NavLink to="/staff/verify">Verify deliveries</NavLink>}
            {["organization_staff", "organization_manager", "organization_owner", "platform_admin", "admin"].includes(user?.role ?? "") && <NavLink to="/organization">Organization</NavLink>}
            {hasPermission(user, "fleet:manage") && <NavLink to="/fleet">Fleet</NavLink>}
            {hasPermission(user, "branding:platform") && <NavLink to="/admin/customization">UI Requests</NavLink>}
            {canAccessAdminProfile(user, api.mode === "http") && <NavLink to="/admin/profile">Admin profile</NavLink>}
            {(hasPermission(user, "organization:billing") || user?.role === "client" || user?.role === "cargo_owner" || user?.role === "driver") && <NavLink to="/subscription">Subscription</NavLink>}
            <NavLink to="/history">Shipments</NavLink>
            <NavLink to="/settings">Settings</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </nav>
          <button type="button" className="btn btn--small" onClick={cycle} aria-label={`${THEME_LABEL[choice]}. Change theme`}>
            {THEME_LABEL[choice]}
          </button>
          {user && <button type="button" className="btn btn--small" onClick={signOut}>Sign out ({user.name.split(" ")[0]})</button>}
        </div>
      </header>
      <DemoStrip />
      <main id="main" className="main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
