import { Disclaimer } from "../../components/Disclaimer";
import { PortfolioClient } from "../../components/PortfolioClient";

export default function PortfolioPage() {
  return (
    <main className="section-stack">
      <section className="hero">
        <div className="eyebrow">Risk Intelligence</div>
        <h1 style={{ maxWidth: "13ch" }}>Run a quick portfolio review before making the next move.</h1>
        <p>Use the backend risk engine to understand exposure, diversification gaps, and practical rebalancing ideas.</p>
      </section>
      <PortfolioClient />
      <Disclaimer />
    </main>
  );
}

