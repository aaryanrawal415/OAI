import { useEffect, useState } from "react";
import type { Place } from "../api/types";
import { isoToLocalInput, localInputToIso } from "../lib/datetime";
import { BODY_LABEL, VEHICLE_CLASSES } from "../lib/reference";
import { truckProblems } from "../lib/validate";
import { isInsideIndia } from "../lib/geo";
import { useWorkspace } from "../state/WorkspaceContext";
import { Button } from "./ui/Button";
import { SelectField, TextField } from "./ui/Field";

interface Props {
  pickMode: boolean;
  onTogglePick: () => void;
  routeOrigin: Place | undefined;
}

export function TruckForm({ pickMode, onTogglePick, routeOrigin }: Props) {
  const { state, dispatch } = useWorkspace();
  const { truck, locationMode } = state;
  const vehicle = VEHICLE_CLASSES.find((v) => v.id === truck.vehicle_class) ?? VEHICLE_CLASSES[0];

  const [payloadText, setPayloadText] = useState(String(truck.available_payload_kg));
  const [latText, setLatText] = useState(String(truck.location.lat));
  const [lngText, setLngText] = useState(String(truck.location.lng));
  const [locationError, setLocationError] = useState<string | null>(null);

  // Keep the text boxes in step when the state changes elsewhere (class change, map click)
  useEffect(() => setPayloadText(String(truck.available_payload_kg)), [truck.available_payload_kg]);
  useEffect(() => {
    setLatText(truck.location.lat.toFixed(4));
    setLngText(truck.location.lng.toFixed(4));
    setLocationError(null);
  }, [truck.location.lat, truck.location.lng]);

  const payloadError = truckProblems(truck).find((p) => p.toLowerCase().includes("payload")) ?? null;

  const changeClass = (id: string) => {
    const next = VEHICLE_CLASSES.find((v) => v.id === id);
    if (!next) return;
    dispatch({
      type: "patchTruck",
      patch: {
        vehicle_class: next.id,
        body_type: next.bodyTypes[0],
        max_payload_kg: next.payloadMaxKg,
        available_payload_kg: next.payloadMaxKg,
        available_volume_m3: next.volumeM3,
      },
    });
  };

  const applyLocation = () => {
    const lat = Number(latText);
    const lng = Number(lngText);
    if (latText.trim() === "" || lngText.trim() === "" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setLocationError("Enter a latitude and a longitude as numbers.");
      return;
    }
    if (!isInsideIndia({ lat, lng })) {
      setLocationError("The location must be inside India.");
      return;
    }
    dispatch({ type: "setLocation", place: { name: "Selected location", lat, lng } });
  };

  return (
    <div className="stack">
      <SelectField label="Vehicle class" value={truck.vehicle_class} onChange={(e) => changeClass(e.target.value)}>
        {VEHICLE_CLASSES.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Body type"
        value={truck.body_type}
        onChange={(e) => dispatch({ type: "patchTruck", patch: { body_type: e.target.value as typeof truck.body_type } })}
      >
        {vehicle.bodyTypes.map((b) => (
          <option key={b} value={b}>
            {BODY_LABEL[b]}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Available payload (kg)"
        type="number"
        inputMode="numeric"
        min={0}
        value={payloadText}
        hint={`The truck's maximum is ${truck.max_payload_kg.toLocaleString("en-IN")} kg. Enter what is free after your delivery.`}
        error={payloadError}
        onChange={(e) => {
          setPayloadText(e.target.value);
          const n = Number(e.target.value);
          dispatch({ type: "patchTruck", patch: { available_payload_kg: Number.isFinite(n) ? n : 0 } });
        }}
      />

      <TextField
        label="Available from"
        type="datetime-local"
        value={isoToLocalInput(truck.available_from)}
        onChange={(e) => {
          const iso = localInputToIso(e.target.value);
          if (iso) dispatch({ type: "patchTruck", patch: { available_from: iso } });
        }}
      />

      <fieldset className="stack" style={{ border: "1px dashed var(--line-strong)", borderRadius: "6px", padding: "0.75rem" }}>
        <legend className="field__label">Truck location (simulated or chosen on the map)</legend>
        <p className="small">
          <strong>{truck.location.name}</strong>{" "}
          <span className="mono muted">
            ({truck.location.lat.toFixed(3)}, {truck.location.lng.toFixed(3)})
          </span>
        </p>
        <div className="grid-2">
          <TextField label="Latitude" inputMode="decimal" value={latText} onChange={(e) => setLatText(e.target.value)} />
          <TextField label="Longitude" inputMode="decimal" value={lngText} onChange={(e) => setLngText(e.target.value)} />
        </div>
        {locationError && (
          <p className="field__error" role="alert">
            {locationError}
          </p>
        )}
        <div className="row" style={{ gap: "0.4rem" }}>
          <Button small onClick={applyLocation}>
            Set location
          </Button>
          <Button small variant={pickMode ? "primary" : "default"} aria-pressed={pickMode} onClick={onTogglePick}>
            {pickMode ? "Click the map…" : "Pick on map"}
          </Button>
          <Button
            small
            variant="ghost"
            disabled={locationMode === "route_start" || !routeOrigin}
            onClick={() => routeOrigin && dispatch({ type: "useRouteStart", origin: routeOrigin })}
          >
            Use route start
          </Button>
        </div>
        <p className="field__hint">No live GPS: the location is only what you set here.</p>
      </fieldset>
    </div>
  );
}
