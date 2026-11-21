import { formatPercent } from "../lib/format";

export function BudgetMeter({ label, fraction, detail }: { label: string; fraction: number | null; detail?: string }) {
  const clamped = fraction == null ? 0 : Math.min(1, Math.max(0, fraction));
  const tone = fraction == null ? "" : fraction > 1 ? "meter__fill--over" : fraction > 0.75 ? "meter__fill--warn" : "";
  return (
    <div className="meter">
      <div className="meter__head">
        <span>{label}</span>
        <span className="mono">{fraction == null ? "Unknown" : formatPercent(fraction)}</span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped * 100)}
      >
        <div className={`meter__fill ${tone}`} style={{ width: `${clamped * 100}%` }} />
      </div>
      {detail && <span className="field__hint">{detail}</span>}
    </div>
  );
}
