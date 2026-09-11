export default function WorkspaceLoading() {
  return (
    <div className="workspace-loading" aria-label="Loading workspace">
      <div className="skeleton skeleton-heading" />
      <div className="workspace-loading-grid">
        <div className="skeleton skeleton-chart" />
        <div className="stack">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      </div>
    </div>
  );
}
