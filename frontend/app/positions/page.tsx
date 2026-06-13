import { Disclaimer } from "../../components/Disclaimer";
import { PositionsClient } from "../../components/PositionsClient";

export default function PositionsPage() {
  return (
    <main className="section-stack">
      <section className="hero">
        <div className="eyebrow">Positions Registry</div>
        <h1 style={{ maxWidth: "12ch" }}>Separate mark price, leverage, and unrealized P&amp;L without ambiguity.</h1>
        <p>
          This workspace implements the workbook fields for position-level market data, leverage context, and stale-data
          handling.
        </p>
      </section>
      <PositionsClient />
      <Disclaimer />
    </main>
  );
}
