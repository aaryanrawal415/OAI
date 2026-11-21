import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { BrandingSettings } from "../state/BrandingProvider";
import { useBranding } from "../state/BrandingProvider";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextField } from "../components/ui/Field";
import { usePageTitle } from "../hooks/usePageTitle";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission } from "../auth/permissions";

const MAX_LOGO_BYTES = 300 * 1024;
const DEFAULT_ACCENT = "#e36414";

export function WebsiteCustomizationPage() {
  usePageTitle("Website customization");
  const { user } = useAuth();
  const canOrganization = hasPermission(user, "branding:organization");
  const canPlatform = hasPermission(user, "branding:platform");
  const { settings, save, reset } = useBranding();
  const [draft, setDraft] = useState<BrandingSettings>(settings);
  const [customColor, setCustomColor] = useState(Boolean(settings.brandColor));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const selectLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setSaved(false);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPEG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("The logo must be 300 KB or smaller.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Could not read the selected logo.");
        return;
      }
      const logoDataUrl = reader.result;
      setDraft((current) => ({ ...current, logoDataUrl }));
    };
    reader.onerror = () => setError("Could not read the selected logo.");
    reader.readAsDataURL(file);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const organizationName = draft.organizationName.trim();
    if (!organizationName) {
      setError("Enter an organization name.");
      setSaved(false);
      return;
    }
    save({
      ...draft,
      organizationName,
      tagline: draft.tagline.trim(),
      brandColor: customColor ? draft.brandColor || DEFAULT_ACCENT : "",
    });
    setDraft((current) => ({ ...current, organizationName }));
    setSaved(true);
    setError(null);
  };

  const restoreDefaults = () => {
    reset();
    setDraft({
      ...settings,
      organizationName: canOrganization ? "OptiFreight AI" : settings.organizationName,
      tagline: canOrganization ? "backhaul matching" : settings.tagline,
      brandColor: "",
      logoDataUrl: canOrganization ? null : settings.logoDataUrl,
      surfaceColor: "",
      inkColor: "",
      backgroundColor: "",
      radius: 6,
      radiusLarge: 10,
      headerHeight: 56,
      cardPadding: 16,
      fontScale: 100,
      compact: false,
      density: "comfortable",
      headerStyle: "brand",
    });
    setCustomColor(false);
    setError(null);
    setSaved(true);
  };

  const previewColor = customColor ? draft.brandColor || DEFAULT_ACCENT : "var(--accent)";

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <span className="eyebrow">Settings / Interface experience</span>
          <h1>Interface customization</h1>
          <p className="muted">
            {canPlatform ? "Platform-level full UI control" : canOrganization ? "Organization-level appearance control" : "Personal basic appearance control"}
          </p>
        </div>
        <Link to="/settings">Back to settings</Link>
      </div>

      <div className="detail-grid">
        <Card title="Brand details">
          <form className="stack" onSubmit={submit} noValidate>
            {canOrganization && (
              <>
            <TextField
              label="Organization name"
              maxLength={60}
              value={draft.organizationName}
              onChange={(event) => {
                setDraft({ ...draft, organizationName: event.target.value });
                setSaved(false);
              }}
            />
              </>
            )}
            {canOrganization && (
            <TextField
              label="Tagline"
              hint="Shown below the organization name in the header."
              maxLength={80}
              value={draft.tagline}
              onChange={(event) => {
                setDraft({ ...draft, tagline: event.target.value });
                setSaved(false);
              }}
            />
            )}
            {canOrganization && <div className="field">
              <span className="field__label">Logo</span>
              <input
                className="input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Upload organization logo"
                onChange={selectLogo}
              />
              <span className="field__hint">PNG, JPEG, or WebP, up to 300 KB. Stored in this browser.</span>
              {draft.logoDataUrl && (
                <Button
                  className="logo-remove"
                  onClick={() => {
                    setDraft({ ...draft, logoDataUrl: null });
                    setSaved(false);
                  }}
                >
                  Remove logo
                </Button>
              )}
            </div>}
            <label className="check">
              <input
                type="checkbox"
                checked={customColor}
                onChange={(event) => {
                  setCustomColor(event.target.checked);
                  setSaved(false);
                }}
              />
              <span>Use a custom accent color</span>
            </label>
            {customColor && (
              <label className="field">
                <span className="field__label">Brand color</span>
                <input
                  className="input color-input"
                  type="color"
                  value={draft.brandColor || DEFAULT_ACCENT}
                  onChange={(event) => {
                    setDraft({ ...draft, brandColor: event.target.value });
                    setSaved(false);
                  }}
                />
              </label>
            )}
            <label className="field">
              <span className="field__label">Interface density</span>
              <select
                className="field__control"
                value={draft.density}
                onChange={(event) => {
                  setDraft({ ...draft, density: event.target.value as "comfortable" | "compact", compact: event.target.value === "compact" });
                  setSaved(false);
                }}
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </label>
            {canOrganization && (
              <label className="field">
                <span className="field__label">Header style</span>
                <select
                  className="field__control"
                  value={draft.headerStyle}
                  onChange={(event) => setDraft({ ...draft, headerStyle: event.target.value as BrandingSettings["headerStyle"] })}
                >
                  <option value="brand">Full brand header</option>
                  <option value="minimal">Minimal header</option>
                  <option value="manifest">Manifest / operations header</option>
                </select>
              </label>
            )}
            {canPlatform && (
              <Card title="Admin micro-control">
                <div className="stack">
                  <label className="field">
                    <span className="field__label">Background color</span>
                    <input className="input color-input" type="color" value={draft.backgroundColor || "#f6f3ec"} onChange={(event) => setDraft({ ...draft, backgroundColor: event.target.value })} />
                  </label>
                  <label className="field">
                    <span className="field__label">Surface color</span>
                    <input className="input color-input" type="color" value={draft.surfaceColor || "#ffffff"} onChange={(event) => setDraft({ ...draft, surfaceColor: event.target.value })} />
                  </label>
                  <label className="field">
                    <span className="field__label">Ink color</span>
                    <input className="input color-input" type="color" value={draft.inkColor || "#14213d"} onChange={(event) => setDraft({ ...draft, inkColor: event.target.value })} />
                  </label>
                  <TextField label="Standard radius (px)" value={String(draft.radius)} onChange={(event) => setDraft({ ...draft, radius: Math.max(0, Math.min(24, Number(event.target.value) || 0)) })} />
                  <TextField label="Large radius (px)" value={String(draft.radiusLarge)} onChange={(event) => setDraft({ ...draft, radiusLarge: Math.max(0, Math.min(32, Number(event.target.value) || 0)) })} />
                  <TextField label="Header height (px)" value={String(draft.headerHeight)} onChange={(event) => setDraft({ ...draft, headerHeight: Math.max(44, Math.min(96, Number(event.target.value) || 44)) })} />
                  <TextField label="Card padding (px)" value={String(draft.cardPadding)} onChange={(event) => setDraft({ ...draft, cardPadding: Math.max(8, Math.min(40, Number(event.target.value) || 8)) })} />
                  <TextField label="Font scale (%)" value={String(draft.fontScale)} onChange={(event) => setDraft({ ...draft, fontScale: Math.max(80, Math.min(125, Number(event.target.value) || 100)) })} />
                </div>
              </Card>
            )}
            {error && <p className="form-error" role="alert">{error}</p>}
            {saved && <p className="banner banner--info" role="status">Website branding saved in this browser.</p>}
            <div className="row">
              <Button type="submit" variant="ink">Save changes</Button>
              <Button onClick={restoreDefaults}>Reset</Button>
            </div>
          </form>
        </Card>

        <Card title="Live preview">
          <p className="muted small">Your header will look like this after you save.</p>
          <div className="brand-preview" style={{ borderColor: previewColor }}>
            {draft.logoDataUrl ? (
              <img src={draft.logoDataUrl} alt="" className="brand__logo" />
            ) : (
              <span className="brand-preview__mark" style={{ backgroundColor: previewColor }} aria-hidden="true">
                {(draft.organizationName.trim()[0] || "O").toUpperCase()}
              </span>
            )}
            <span className="brand-preview__copy">
              <strong>{draft.organizationName.trim() || "Organization name"}</strong>
              <span>{draft.tagline.trim() || " "}</span>
            </span>
          </div>
          <p className="field__hint">Brand preferences are saved on this device and are not yet synced to a server.</p>
        </Card>
      </div>
    </div>
  );
}
