import { DashboardClient } from "../../components/DashboardClient";
import { Disclaimer } from "../../components/Disclaimer";

export default function DashboardPage() {
  return (
    <main className="section-stack">
      <section className="hero">
        <div className="eyebrow">Live Analysis Workspace</div>
        <h1 style={{ maxWidth: "14ch" }}>Track watchlists, monitor risk, and verify exactly which API field powers each panel.</h1>
        <p>
          This dashboard now mirrors the registry workbook with account summary, margin alerts, position snapshots,
          order lifecycle states, and market depth/time-and-sales panels.
        </p>
      </section>
      <DashboardClient />
      <Disclaimer />
    </main>
  );
}
