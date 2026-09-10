export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading workspace"
      className="loading-layout"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-kpi" />
      <div className="skeleton skeleton-chart" />
      <span className="muted">Loading your workspace…</span>
    </div>
  );
}
