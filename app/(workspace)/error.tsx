"use client";
import { AlertTriangle } from "lucide-react";
export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <section className="panel empty-state">
      <AlertTriangle size={32} />
      <h1>We couldn’t load your workspace</h1>
      <p>
        Check your connection and try again. If the problem continues, contact
        your workspace administrator.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
