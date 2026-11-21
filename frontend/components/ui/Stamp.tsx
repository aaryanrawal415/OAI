import type { Verdict } from "../../api/types";
import { VERDICT_LABEL, VERDICT_SYMBOL } from "../../lib/verdict";

/** Verdict as a stamp: always a symbol and a word, never colour alone. */
export function Stamp({ verdict, label }: { verdict: Verdict; label?: string }) {
  return (
    <span className={`stamp stamp--${verdict}`}>
      <span aria-hidden="true">{VERDICT_SYMBOL[verdict]}</span>
      {label ?? VERDICT_LABEL[verdict]}
    </span>
  );
}
