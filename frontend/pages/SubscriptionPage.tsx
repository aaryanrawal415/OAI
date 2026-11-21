import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission } from "../auth/permissions";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import { readJson, writeJson } from "../lib/storage";
import { getPlan, getSubscription, planPrice, SERVICE_PLANS } from "../lib/subscriptions";
import type { Subscription } from "../api/types";

const KEY = "of_subscription";
const BILLING_EMAIL = "optifreight.ai@gmail.com";

export function SubscriptionPage() {
  usePageTitle("Subscription");
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(() => readJson<Subscription | null>(KEY, null));
  const [cycle, setCycle] = useState<Subscription["billing_cycle"]>(subscription?.billing_cycle ?? "monthly");
  const [selected, setSelected] = useState<Subscription["plan"]>(subscription?.plan ?? user?.tier ?? "basic");
  const [saved, setSaved] = useState(false);
  const effective = getSubscription(user, subscription);
  const currentPlan = getPlan(effective.plan);
  const canManage = hasPermission(user, "organization:billing") || !!user && ["client", "cargo_owner", "driver"].includes(user.role);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!canManage) return;
    const now = new Date();
    const end = new Date(now);
    if (cycle === "annual") end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);
    const next: Subscription = {
      id: effective.id,
      plan: selected,
      status: "trialing",
      billing_cycle: cycle,
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
      cancel_at_period_end: false,
    };
    setSubscription(next);
    writeJson(KEY, next);
    setSaved(true);
  };

  const cancel = () => {
    if (!canManage || !subscription) return;
    const next = { ...subscription, cancel_at_period_end: true };
    setSubscription(next);
    writeJson(KEY, next);
  };

  const requestBilling = (planId: Subscription["plan"]) => {
    const plan = getPlan(planId);
    const price = planPrice(plan, cycle);
    const subject = encodeURIComponent(`Subscription request - ${plan.name}`);
    const body = encodeURIComponent([
      `Account: ${user?.name ?? ""} (${user?.email ?? ""})`,
      `Organization ID: ${user?.organization_id ?? "Individual"}`,
      `Plan: ${plan.name}`,
      `Billing cycle: ${cycle}`,
      `Indicative price: INR ${price}`,
      "",
      "Please send secure payment and invoice details.",
    ].join("\n"));
    window.location.href = `mailto:${BILLING_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Billing</span>
          <h1>Subscription plans</h1>
        </div>
      </div>

      <Card title="Current subscription">
        <dl className="kv">
          <dt>Plan</dt><dd>{currentPlan.name}</dd>
          <dt>Status</dt><dd><span className={`badge ${effective.status === "active" ? "badge--info" : "badge--demo"}`}>{effective.status}</span></dd>
          <dt>Billing cycle</dt><dd>{effective.billing_cycle}</dd>
          <dt>Next/period end</dt><dd>{new Date(effective.current_period_end).toLocaleDateString()}</dd>
          {effective.cancel_at_period_end && <><dt>Renewal</dt><dd>Cancelled at period end</dd></>}
        </dl>
        {subscription?.cancel_at_period_end && <p className="banner banner--warn">The subscription will end at the current period boundary.</p>}
      </Card>

      {canManage && (
        <form className="stack-lg" onSubmit={save}>
          <Card title="Choose billing cycle">
            <div className="theme-toggle" role="group" aria-label="Billing cycle">
              {(["monthly", "annual"] as const).map((value) => (
                <button key={value} type="button" className={`theme-toggle__button ${cycle === value ? "theme-toggle__button--active" : ""}`} aria-pressed={cycle === value} onClick={() => setCycle(value)}>
                  {value === "annual" ? "Annual (2 months free)" : "Monthly"}
                </button>
              ))}
            </div>
          </Card>
          <div className="detail-grid">
            {SERVICE_PLANS.map((plan) => (
              <Card key={plan.id} title={`${plan.name} - INR ${planPrice(plan, cycle).toLocaleString("en-IN")}${cycle === "annual" ? "/year" : "/month"}`}>
                <div className="stack">
                  <p className="muted">{plan.description}</p>
                  <ul>
                    {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                  <dl className="kv">
                    <dt>Monthly jobs</dt><dd>{plan.limits.monthlyJobs === -1 ? "Unlimited" : plan.limits.monthlyJobs}</dd>
                    <dt>Drivers</dt><dd>{plan.limits.drivers === -1 ? "Unlimited" : plan.limits.drivers}</dd>
                    <dt>Staff seats</dt><dd>{plan.limits.staff === -1 ? "Unlimited" : plan.limits.staff}</dd>
                  </dl>
                  <Button type="button" variant={selected === plan.id ? "primary" : "ink"} onClick={() => setSelected(plan.id)}>
                    {selected === plan.id ? "Selected" : "Choose plan"}
                  </Button>
                  {selected === plan.id && <Button type="button" onClick={() => requestBilling(plan.id)}>Request secure checkout</Button>}
                </div>
              </Card>
            ))}
          </div>
          {saved && <p className="banner banner--info" role="status">Selection saved as a trial/subscription request. Secure payment activation is pending server billing integration.</p>}
          <div className="row">
            <Button type="submit" variant="ink">Save selection</Button>
            {subscription && <Button type="button" variant="danger" onClick={cancel}>Cancel at period end</Button>}
          </div>
        </form>
      )}
    </div>
  );
}
