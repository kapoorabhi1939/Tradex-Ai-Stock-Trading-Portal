import { Disclaimer } from "../../components/Disclaimer";
import { OrdersClient } from "../../components/OrdersClient";

export default function OrdersPage() {
  return (
    <main className="section-stack">
      <section className="hero">
        <div className="eyebrow">Orders Registry</div>
        <h1 style={{ maxWidth: "13ch" }}>Model the full lifecycle from draft through fill and reconcile.</h1>
        <p>
          The order workspace implements the registry requirements for server-driven order types, fee estimates, and
          accessible lifecycle states.
        </p>
      </section>
      <OrdersClient />
      <Disclaimer />
    </main>
  );
}
