interface Props {
  used: number;
  max: number;
  perDay: number | null;
  usedToday: number;
}

export function JobCounter({ used, max, perDay, usedToday }: Props) {
  return (
    <div className="stack" style={{ gap: "0.4rem" }}>
      <div className="counter" role="img" aria-label={`${used} of ${max} jobs used on this trip`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`counter__pip ${i < used ? "counter__pip--used" : ""}`} />
        ))}
      </div>
      <p className="small muted">
        <span className="mono">
          {used} of {max}
        </span>{" "}
        jobs on this trip
        {perDay != null && (
          <>
            ,{" "}
            <span className="mono">
              {usedToday} of {perDay}
            </span>{" "}
            today
          </>
        )}
        . A bundle counts as one.
      </p>
    </div>
  );
}
