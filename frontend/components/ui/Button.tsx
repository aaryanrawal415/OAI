import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "default" | "primary" | "ink" | "danger" | "ghost";

interface Look {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
}

function classes({ variant = "default", small, block }: Look, extra?: string): string {
  return ["btn", variant !== "default" && `btn--${variant}`, small && "btn--small", block && "btn--block", extra]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  small,
  block,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & Look) {
  return <button type="button" className={classes({ variant, small, block }, className)} {...rest} />;
}

export function ButtonLink({ variant, small, block, className, ...rest }: LinkProps & Look) {
  return <Link className={classes({ variant, small, block }, className)} {...rest} />;
}

/** A plain link that opens in a new tab and looks like a button. */
export function ExternalButton({
  variant,
  small,
  block,
  className,
  children,
  href,
}: Look & { className?: string; children: ReactNode; href: string }) {
  return (
    <a className={classes({ variant, small, block }, className)} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
