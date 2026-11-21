import type { ShipmentStatus } from "../api/types";
import { formatDateTime } from "../lib/format";

const STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: "accepted", label: "Accepted" },
  { status: "heading_to_pickup", label: "Heading to pickup" },
  { status: "loaded", label: "Loaded" },
  { status: "in_transit", label: "In transit" },
  { status: "delivered", label: "Delivered" },
];

interface Props {
  status: ShipmentStatus;
  history: { status: ShipmentStatus; at: string }[];
}

/** Progress is simulated status steps. There is no GPS tracking. */
export function StatusTimeline({ status, history }: Props) {
  if (status === "cancelled") {
    const when = history.find((h) => h.status === "cancelled")?.at;
    return (
      <p className="banner banner--warn" role="status">
        This shipment was cancelled{when ? ` on ${formatDateTime(when)}` : ""}. The job is released.
      </p>
    );
  }
  const current = STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="steps" aria-label="Shipment progress">
      {STEPS.map((step, i) => {
        const done = i < current || status === "delivered";
        const isCurrent = i === current && status !== "delivered";
        const at = history.find((h) => h.status === step.status)?.at;
        return (
          <li
            key={step.status}
            className={`steps__item ${done ? "steps__item--done" : ""} ${isCurrent ? "steps__item--current" : ""}`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className="steps__dot" aria-hidden="true">
              {done ? "✓" : i + 1}
            </span>
            <div>
              <span className="steps__name">{step.label}</span>
              {at && <p className="small muted">{formatDateTime(at)}</p>}
              <span className="sr-only">{done ? "Done" : isCurrent ? "Current step" : "Not reached yet"}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
