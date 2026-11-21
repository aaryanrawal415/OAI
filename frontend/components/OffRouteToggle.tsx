import { useId } from "react";

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/** The driver-controlled option. Off by default. It never relaxes capacity, safety, or timing rules. */
export function OffRouteToggle({ checked, onChange, disabled }: Props) {
  const id = useId();
  return (
    <label className="check" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong>Allow off-route pickups and drops (up to 40 km round trip each)</strong>
        <span className="field__hint" style={{ display: "block" }}>
          Off: only stops on your route. On: a stop may add a detour of up to 40 km round trip, measured by road.
          Capacity, cargo and timing rules still apply.
        </span>
      </span>
    </label>
  );
}
