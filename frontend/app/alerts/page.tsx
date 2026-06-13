import { AlertsClient } from "../../components/AlertsClient";
import { Disclaimer } from "../../components/Disclaimer";

export default function AlertsPage() {
  return (
    <main className="section-stack">
      <section className="hero">
        <div className="eyebrow">Alert Workflow</div>
        <h1 style={{ maxWidth: "14ch" }}>Create threshold alerts for the signals and prices you care about.</h1>
        <p>Alerts are modeled as part of the application layer and can later be extended to email, push, or in-app delivery.</p>
      </section>
      <AlertsClient />
      <Disclaimer />
    </main>
  );
}

