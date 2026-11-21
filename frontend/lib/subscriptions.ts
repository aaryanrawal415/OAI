import type { Subscription, User } from "../api/types";

export interface ServicePlan {
  id: "basic" | "professional" | "enterprise";
  name: string;
  monthlyInr: number;
  annualInr: number;
  description: string;
  features: string[];
  limits: {
    monthlyJobs: number;
    drivers: number;
    staff: number;
    proofStorageGb: number;
  };
}

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: "basic",
    name: "Basic",
    monthlyInr: 999,
    annualInr: 9990,
    description: "For independent clients and drivers.",
    features: ["Single account", "Standard matching", "Basic delivery proof", "Email support"],
    limits: { monthlyJobs: 20, drivers: 1, staff: 1, proofStorageGb: 5 },
  },
  {
    id: "professional",
    name: "Professional",
    monthlyInr: 4999,
    annualInr: 49990,
    description: "For companies managing regular operations.",
    features: ["Up to 10 users", "Organization dashboard", "Staff verification", "Medium customization", "Priority support"],
    limits: { monthlyJobs: 250, drivers: 25, staff: 10, proofStorageGb: 100 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyInr: 14999,
    annualInr: 149990,
    description: "For fleets and high-volume organizations.",
    features: ["Unlimited jobs", "Unlimited organization staff", "Advanced reporting", "Custom integrations", "Dedicated support"],
    limits: { monthlyJobs: -1, drivers: -1, staff: -1, proofStorageGb: 1000 },
  },
];

export function getSubscription(user: User | null, current: Subscription | null): Subscription {
  if (current) return current;
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 14);
  return {
    id: `sub-${user?.id ?? "guest"}`,
    plan: user?.tier ?? "basic",
    status: "trialing",
    billing_cycle: "monthly",
    current_period_start: now.toISOString(),
    current_period_end: end.toISOString(),
    cancel_at_period_end: false,
  };
}

export function getPlan(id: Subscription["plan"]): ServicePlan {
  return SERVICE_PLANS.find((plan) => plan.id === id) ?? SERVICE_PLANS[0];
}

export function planPrice(plan: ServicePlan, cycle: Subscription["billing_cycle"]): number {
  return cycle === "annual" ? plan.annualInr : plan.monthlyInr;
}
