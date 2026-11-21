import { useState, type FormEvent } from "react";
import type { Place } from "../api/types";
import { useAddManualCargo, useDeleteManualCargo, useManualCargo } from "../hooks/useApiData";
import { localInputToIso } from "../lib/datetime";
import { formatInr, formatKg } from "../lib/format";
import { CARGO_CATEGORIES, HUB_OPTIONS } from "../lib/reference";
import { manualProblems, parsePoint, type ManualDraft, type ManualErrors, type PlaceDraft } from "../lib/validate";
import { Button } from "./ui/Button";
import { SelectField, TextField } from "./ui/Field";

const emptyPlace: PlaceDraft = { hub: "", name: "", lat: "", lng: "" };
const emptyDraft: ManualDraft = {
  title: "",
  category: "",
  weight: "",
  rate: "",
  pickup: emptyPlace,
  drop: emptyPlace,
  windowStart: "",
  windowEnd: "",
};

function PlaceInput({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: PlaceDraft;
  error?: string | null;
  onChange: (next: PlaceDraft) => void;
}) {
  const choose = (hub: string) => {
    if (hub === "" || hub === "custom") {
      onChange({ ...emptyPlace, hub });
      return;
    }
    const found = HUB_OPTIONS.find((h) => h.id === hub);
    if (found) onChange({ hub, name: found.name, lat: String(found.lat), lng: String(found.lng) });
  };
  return (
    <div className="stack" style={{ gap: "0.5rem" }}>
      <SelectField label={label} value={value.hub} error={error} onChange={(e) => choose(e.target.value)}>
        <option value="">Choose a place…</option>
        {HUB_OPTIONS.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
          </option>
        ))}
        <option value="custom">Other (enter coordinates)</option>
      </SelectField>
      {value.hub === "custom" && (
        <div className="grid-3">
          <TextField label="Name" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
          <TextField label="Latitude" inputMode="decimal" value={value.lat} onChange={(e) => onChange({ ...value, lat: e.target.value })} />
          <TextField label="Longitude" inputMode="decimal" value={value.lng} onChange={(e) => onChange({ ...value, lng: e.target.value })} />
        </div>
      )}
    </div>
  );
}

function toPlace(draft: PlaceDraft): Place {
  const point = parsePoint(draft);
  return { name: draft.name.trim() || "Custom place", lat: point?.lat ?? 0, lng: point?.lng ?? 0 };
}

/** Manual listings. Their road distances cannot be verified in demo mode, so they show as unverified. */
export function ManualCargoForm() {
  const [draft, setDraft] = useState<ManualDraft>(emptyDraft);
  const [errors, setErrors] = useState<ManualErrors>({});
  const [saved, setSaved] = useState(false);
  const add = useAddManualCargo();
  const remove = useDeleteManualCargo();
  const list = useManualCargo();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    const found = manualProblems(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    add.mutate(
      {
        title: draft.title.trim(),
        category: draft.category,
        weight_kg: Number(draft.weight),
        rate_inr: draft.rate.trim() === "" ? null : Number(draft.rate),
        pickup: toPlace(draft.pickup),
        drop: toPlace(draft.drop),
        pickup_window_start: localInputToIso(draft.windowStart),
        pickup_window_end: localInputToIso(draft.windowEnd),
      },
      {
        onSuccess: () => {
          setDraft(emptyDraft);
          setSaved(true);
        },
      },
    );
  };

  return (
    <div className="stack">
      <form className="stack" onSubmit={submit} noValidate aria-label="Add your own cargo listing">
        <TextField label="Load description" value={draft.title} error={errors.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <SelectField label="Cargo category" value={draft.category} error={errors.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
          <option value="">Choose…</option>
          {CARGO_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <div className="grid-2">
          <TextField label="Weight (kg)" type="number" min={0} value={draft.weight} error={errors.weight} onChange={(e) => setDraft({ ...draft, weight: e.target.value })} />
          <TextField label="Payment (₹, optional)" type="number" min={0} value={draft.rate} error={errors.rate} onChange={(e) => setDraft({ ...draft, rate: e.target.value })} />
        </div>
        <PlaceInput label="Pickup" value={draft.pickup} error={errors.pickup} onChange={(pickup) => setDraft({ ...draft, pickup })} />
        <PlaceInput label="Drop" value={draft.drop} error={errors.drop} onChange={(drop) => setDraft({ ...draft, drop })} />
        <div className="grid-2">
          <TextField label="Pickup window opens (optional)" type="datetime-local" value={draft.windowStart} onChange={(e) => setDraft({ ...draft, windowStart: e.target.value })} />
          <TextField label="Pickup window closes (optional)" type="datetime-local" value={draft.windowEnd} error={errors.window} onChange={(e) => setDraft({ ...draft, windowEnd: e.target.value })} />
        </div>
        {add.isError && (
          <p className="form-error" role="alert">
            {add.error instanceof Error ? add.error.message : "Could not save the listing."}
          </p>
        )}
        {saved && (
          <p className="banner banner--info" role="status">
            Listing saved. Run the search again to include it. It will show as unverified until a routing engine checks its distances.
          </p>
        )}
        <Button type="submit" variant="ink" disabled={add.isPending}>
          {add.isPending ? "Saving…" : "Add listing"}
        </Button>
      </form>

      {list.data && list.data.length > 0 && (
        <div className="stack">
          <h3>Your listings</h3>
          <ul className="checks">
            {list.data.map((m) => (
              <li className="checks__item" key={m.id} style={{ gridTemplateColumns: "1fr auto" }}>
                <div>
                  <span className="checks__label">{m.title}</span>
                  <p className="small muted">
                    {formatKg(m.weight_kg)} · {formatInr(m.rate_inr)} · {m.pickup.name} → {m.drop.name}
                  </p>
                </div>
                <Button small variant="danger" onClick={() => remove.mutate(m.id)} aria-label={`Delete ${m.title}`}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
