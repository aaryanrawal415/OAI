import type { TimelineStop } from "../api/types";
import { formatDateTime } from "../lib/format";
import { Stamp } from "./ui/Stamp";

function Row({ stop }: { stop: TimelineStop }) {
  const arrival = new Date(stop.arrival).getTime();
  const open = stop.window_start ? new Date(stop.window_start).getTime() : null;
  const close = stop.window_end ? new Date(stop.window_end).getTime() : null;

  if (open == null || close == null) {
    return (
      <li className="stack" style={{ gap: "0.25rem" }}>
        <div className="row-between">
          <strong>{stop.label}</strong>
          <Stamp verdict="unknown" label="No window given" />
        </div>
        <p className="small muted">Expected arrival {formatDateTime(stop.arrival)}. The listing gives no time window, so timing is not confirmed.</p>
      </li>
    );
  }

  const pad = Math.max(3_600_000, (close - open) * 0.5);
  const min = Math.min(open, arrival) - pad;
  const max = Math.max(close, arrival) + pad;
  const pos = (t: number): number => ((t - min) / (max - min)) * 100;
  const verdict = arrival > close ? "fail" : arrival < open ? "unknown" : "pass";
  const label = arrival > close ? "Too late" : arrival < open ? "Early: would wait" : "Inside window";

  return (
    <li className="stack" style={{ gap: "0.35rem" }}>
      <div className="row-between">
        <strong>{stop.label}</strong>
        <Stamp verdict={verdict} label={label} />
      </div>
      <div className="window-bar" role="img" aria-label={`${stop.label}: ${label}. Window ${formatDateTime(stop.window_start)} to ${formatDateTime(stop.window_end)}, arrival ${formatDateTime(stop.arrival)}.`}>
        <div className="window-bar__range" style={{ left: `${pos(open)}%`, width: `${pos(close) - pos(open)}%` }} />
        <div className="window-bar__dot" style={{ left: `${pos(arrival)}%` }} />
      </div>
      <p className="small muted">
        Window {formatDateTime(stop.window_start)} to {formatDateTime(stop.window_end)}. Expected arrival {formatDateTime(stop.arrival)}.
      </p>
    </li>
  );
}

export function TimelineBar({ stops }: { stops: TimelineStop[] }) {
  return (
    <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {stops.map((stop) => (
        <Row key={stop.label} stop={stop} />
      ))}
    </ul>
  );
}
