import type { ReactNode } from "react";
import type { Verdict } from "../../api/types";

interface Props {
  title?: ReactNode;
  actions?: ReactNode;
  tone?: Verdict;
  selected?: boolean;
  flat?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ title, actions, tone, selected, flat, className, children }: Props) {
  const cls = [
    "card",
    flat && "card--flat",
    tone && `card--manifest card--${tone}`,
    selected && "card--selected",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section className={cls}>
      {(title || actions) && (
        <div className="card__title">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
