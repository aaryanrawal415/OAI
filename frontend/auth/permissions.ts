import type { User } from "../api/types";

export type Permission =
  | "jobs:create"
  | "jobs:remove"
  | "jobs:accept"
  | "deliveries:update"
  | "deliveries:verify"
  | "proof:upload"
  | "organization:manage"
  | "organization:billing"
  | "fleet:manage"
  | "users:manage"
  | "audit:view"
  | "branding:basic"
  | "branding:organization"
  | "branding:platform";

const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  client: ["jobs:create", "jobs:remove", "audit:view", "branding:basic"],
  driver: ["deliveries:update", "proof:upload", "jobs:accept", "branding:basic"],
  organization_staff: ["jobs:create", "jobs:remove", "deliveries:verify", "audit:view", "branding:basic", "branding:organization"],
  organization_manager: ["jobs:create", "jobs:remove", "deliveries:verify", "organization:manage", "organization:billing", "users:manage", "audit:view", "branding:basic", "branding:organization"],
  organization_owner: ["jobs:create", "jobs:remove", "jobs:accept", "deliveries:verify", "organization:manage", "organization:billing", "fleet:manage", "users:manage", "audit:view", "branding:basic", "branding:organization"],
  cargo_owner: ["jobs:create", "jobs:remove", "jobs:accept", "deliveries:verify", "organization:manage", "organization:billing", "fleet:manage", "users:manage", "audit:view", "branding:basic", "branding:organization"],
  platform_admin: ["jobs:create", "jobs:remove", "deliveries:verify", "organization:manage", "organization:billing", "users:manage", "audit:view", "branding:basic", "branding:organization", "branding:platform"],
  admin: ["organization:manage", "organization:billing", "users:manage", "audit:view", "branding:basic", "branding:platform"],
};

export function hasPermission(user: User | null, permission: Permission): boolean {
  return !!user && ROLE_PERMISSIONS[user.role]?.includes(permission);
}

export function isOrganizationRole(user: User | null): boolean {
  return !!user && ["organization_staff", "organization_manager", "organization_owner", "cargo_owner", "platform_admin", "admin"].includes(user.role);
}

export const ADMIN_PROFILE_EMAIL = "optifreight.ai@gmail.com";

export function canAccessAdminProfile(user: User | null, httpAuth: boolean): boolean {
  return !!user
    && httpAuth
    && user.role === "platform_admin"
    && user.email.trim().toLowerCase() === ADMIN_PROFILE_EMAIL;
}
