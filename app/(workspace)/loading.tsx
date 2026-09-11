export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className="loading-layout"
    >
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-chart" />
      <span className="muted">Loading your workspace…</span>
    </div>
  );
}
