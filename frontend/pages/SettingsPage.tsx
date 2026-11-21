import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import type { CostOverrides } from "../api/types";
import { useAuth } from "../auth/AuthProvider";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextField } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import { useTheme, type ThemeChoice } from "../state/ThemeProvider";
import { useWorkspace } from "../state/WorkspaceContext";
import { hasPermission } from "../auth/permissions";

const FIELDS: { key: keyof CostOverrides; label: string; hint: string }[] = [
  { key: "diesel_inr_per_l", label: "Diesel price (₹ per litre)", hint: "Leave blank to use the default estimate." },
  { key: "mileage_km_per_l", label: "Loaded mileage (km per litre)", hint: "Defaults to your vehicle class." },
  { key: "toll_inr_per_km", label: "Tolls (₹ per km)", hint: "An estimate per km, not per toll plaza." },
  { key: "driver_inr_per_hour", label: "Driver cost (₹ per hour)", hint: "Applied to the extra active time a job adds." },
];

export function SettingsPage() {
  usePageTitle("Settings");
  const { state, dispatch } = useWorkspace();
  const { token, user } = useAuth();
  const { choice, setChoice } = useTheme();
  const client = useQueryClient();
  const [text, setText] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, state.costOverrides[f.key] != null ? String(state.costOverrides[f.key]) : ""])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const apply = (event: FormEvent) => {
    event.preventDefault();
    const next: CostOverrides = {};
    const found: Record<string, string> = {};
    for (const f of FIELDS) {
      const raw = text[f.key].trim();
      if (raw === "") continue;
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) found[f.key] = "Enter a number above 0, or leave it blank.";
      else next[f.key] = value;
    }
    setErrors(found);
    setApplied(false);
    if (Object.keys(found).length > 0) return;
    dispatch({ type: "setCosts", costs: next });
    setApplied(true);
  };

  const clear = () => {
    setText(Object.fromEntries(FIELDS.map((f) => [f.key, ""])));
    setErrors({});
    dispatch({ type: "setCosts", costs: {} });
    setApplied(true);
  };

  const resetDemo = async () => {
    if (api.resetDemoData && token) await api.resetDemoData(token);
    dispatch({ type: "clearMatch" });
    await client.invalidateQueries();
    setConfirmReset(false);
  };

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Settings</span>
          <h1>Costs, look, and data</h1>
        </div>
      </div>

      <div className="detail-grid">
        <Card title="What-if costs">
          <form className="stack" onSubmit={apply} noValidate>
            <p className="muted small">
              Change the cost assumptions to see how estimated net earnings move. Run the search again afterwards. Only costs a job
              adds are counted.
            </p>
            {FIELDS.map((f) => (
              <TextField
                key={f.key}
                label={f.label}
                hint={f.hint}
                inputMode="decimal"
                value={text[f.key]}
                error={errors[f.key]}
                onChange={(e) => setText({ ...text, [f.key]: e.target.value })}
              />
            ))}
            {applied && (
              <p className="banner banner--info" role="status">
                Saved. Run the search again to see updated estimates.
              </p>
            )}
            <div className="row">
              <Button type="submit" variant="ink">
                Apply
              </Button>
              <Button onClick={clear}>Use defaults</Button>
            </div>
          </form>
        </Card>

        <div className="stack-lg">
          <Card title="Appearance">
            <div className="field">
              <span className="field__label">Theme</span>
              <div className="theme-toggle" role="group" aria-label="Choose theme">
                {([
                  ["system", "System"],
                  ["light", "Light"],
                  ["dark", "Dark"],
                ] as [ThemeChoice, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`theme-toggle__button ${choice === value ? "theme-toggle__button--active" : ""}`}
                    aria-pressed={choice === value}
                    onClick={() => setChoice(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Website customization">
            <p className="muted small">
              {hasPermission(user, "branding:platform")
                ? "Full platform UI control: brand, layout, spacing, typography, and micro-details."
                : "Personal theme and basic preferences are available. High-level and organization UI changes require an approved request."}
            </p>
            {hasPermission(user, "branding:platform") ? (
              <ButtonLink to="/settings/website" variant="ink">Open platform customization</ButtonLink>
            ) : (
              <ButtonLink to="/settings/customization-request" variant="ink">Request customization</ButtonLink>
            )}
          </Card>

          <Card title="About this build">
            <dl className="kv">
              <dt>Data mode</dt>
              <dd>{api.mode === "mock" ? "Demonstration" : "Server"}</dd>
              <dt>Google Maps minimap</dt>
              <dd>{import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY ? "Key set" : "Not set (free map)"}</dd>
              <dt>Live GPS</dt>
              <dd>Not used</dd>
            </dl>
            {api.mode === "mock" && (
              <p className="field__hint" style={{ marginTop: "0.5rem" }}>
                In demonstration mode the listings are invented, the rules are checked by a demo evaluator in your browser, and no
                trained model is connected.
              </p>
            )}
          </Card>

          {api.resetDemoData && (
            <Card title="Reset demonstration data">
              {!confirmReset ? (
                <Button variant="danger" onClick={() => setConfirmReset(true)}>
                  Delete my demo shipments and listings
                </Button>
              ) : (
                <div className="banner banner--warn stack">
                  <p>This removes the shipments and manual listings saved in this browser for your account.</p>
                  <div className="row">
                    <Button variant="danger" onClick={() => void resetDemo()}>
                      Yes, delete them
                    </Button>
                    <Button onClick={() => setConfirmReset(false)}>Keep them</Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
