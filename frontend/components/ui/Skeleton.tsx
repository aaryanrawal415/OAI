export function Skeleton({ height = "1rem", width = "100%" }: { height?: string; width?: string }) {
  return <span className="skeleton" style={{ height, width }} aria-hidden="true" />;
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="stack" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div className="card" key={i}>
          <div className="stack">
            <Skeleton height="1.1rem" width="70%" />
            <Skeleton width="45%" />
            <Skeleton height="2.2rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
