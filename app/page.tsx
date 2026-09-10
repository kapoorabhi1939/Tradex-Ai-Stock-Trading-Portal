import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChartPie,
  Bell,
  ScanLine,
  Check,
} from "lucide-react";
import {
  Brand,
  DemoBadge,
  Change,
  Disclaimer,
  SignalBadge,
} from "@/components/ui";
import { getEquity } from "@/lib/demo-market";
import { calculateSignal } from "@/lib/signals";
import { money } from "@/lib/format";
import { PriceChart } from "@/components/charts";
export default function Landing() {
  const equity = getEquity("NVDA")!;
  const signal = calculateSignal(equity);
  return (
    <div className="landing">
      <header className="marketing-nav">
        <Brand />
        <nav aria-label="Public navigation">
          <a href="#perspective">The platform</a>
          <a href="#methodology">Our approach</a>
          <Link className="button" href="/login">
            Sign in <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span /> EQUITY RESEARCH, WITH PERSPECTIVE
            </p>
            <h1>
              Clarity before
              <br />
              <em>conviction.</em>
            </h1>
            <p className="hero-description">
              Understand the signal. See your exposure.
              <br />
              Bring a more thoughtful perspective to every market decision.
            </p>
            <div className="hero-ctas">
              <Link className="button large-button" href="/login">
                Explore Tradex <ArrowRight size={18} />
              </Link>
              <a href="#perspective" className="text-link">
                Take a closer look <ArrowDownIcon />
              </a>
            </div>
            <div className="hero-trust">
              <span>
                <Check size={15} /> Explainable by design
              </span>
              <span>
                <Check size={15} /> Your research, connected
              </span>
            </div>
          </div>
          <div className="hero-preview">
            <div className="preview-top">
              <span>
                <ScanLine size={17} /> MARKET LENS
              </span>
              <DemoBadge />
            </div>
            <div className="preview-company">
              <div>
                <span className="eyebrow">NVDA / TECHNOLOGY</span>
                <h2>NVIDIA Corporation</h2>
              </div>
              <ArrowUpRight size={23} />
            </div>
            <div className="preview-price">
              <strong>{money(equity.price)}</strong>
              <Change value={equity.change} />
            </div>
            <PriceChart equity={equity} compact />
            <div className="preview-signal">
              <div>
                <span className="stat-label">Model indication</span>
                <SignalBadge signal={signal.signal} />
              </div>
              <div>
                <strong>{signal.confidence}%</strong>
                <span>Signal confidence</span>
              </div>
            </div>
            <p className="preview-caption">
              Interactive product preview · Fictional market snapshot
            </p>
          </div>
        </section>
        <div className="landing-proof">
          <span>A CONNECTED RESEARCH WORKFLOW</span>
          <strong>12 US equities</strong>
          <span className="proof-separator" />
          <strong>Transparent factors</strong>
          <span className="proof-separator" />
          <strong>Portfolio perspective</strong>
          <span className="proof-separator" />
          <strong>Saved to your account</strong>
        </div>
        <section className="perspective-section" id="perspective">
          <div className="section-intro">
            <p className="eyebrow">FROM INFORMATION TO UNDERSTANDING</p>
            <h2>
              Connect the dots.
              <br />
              Keep your perspective.
            </h2>
            <p className="muted">
              A focused workspace for the questions that matter, from an
              individual company to your entire portfolio.
            </p>
          </div>
          <div className="feature-list">
            {[
              [
                ChartNoAxesCombined,
                "01",
                "Understand what’s moving.",
                "Explore price history, company context, and directional model indications with the factors behind every score.",
              ],
              [
                ChartPie,
                "02",
                "See beyond individual positions.",
                "Save your holdings and uncover sector exposure, concentration, and historical volatility indicators.",
              ],
              [
                Bell,
                "03",
                "Keep your thesis in focus.",
                "Create price and signal conditions, evaluate the demo snapshot, and revisit a saved history of matches.",
              ],
            ].map(([Icon, n, title, description]) => {
              const FeatureIcon = Icon as typeof Bell;
              return (
                <article className="feature-row" key={String(n)}>
                  <span className="feature-icon">
                    <FeatureIcon size={25} />
                  </span>
                  <div>
                    <span className="eyebrow">PERSPECTIVE {String(n)}</span>
                    <h3>{String(title)}</h3>
                    <p>{String(description)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="methodology-section" id="methodology">
          <div>
            <p className="eyebrow">TRANSPARENCY IS THE STARTING POINT</p>
            <h2>
              A signal you can question.
              <br />A process you can understand.
            </h2>
          </div>
          <div>
            <p>
              Every indication starts with observable factors: price momentum,
              moving-average relationships, and demonstration sentiment.
              Historical volatility helps temper confidence.
            </p>
            <p>
              This MVP uses a deterministic market dataset and a transparent
              baseline model. No live feed, hidden AI prediction, or promised
              outcome.
            </p>
            <Link href="/login" className="text-link">
              Explore the research workspace <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="landing-cta">
          <div>
            <p className="eyebrow">MAKE ROOM FOR A CLEARER VIEW</p>
            <h2>Your research. In perspective.</h2>
          </div>
          <Link href="/login" className="button large-button">
            Sign in to Tradex <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="marketing-footer">
        <Brand />
        <Disclaimer />
        <span>© 2026 Tradex AI</span>
      </footer>
    </div>
  );
}
function ArrowDownIcon() {
  return <span aria-hidden="true">↓</span>;
}
