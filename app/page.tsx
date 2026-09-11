import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BellRing,
  ChartNoAxesCombined,
  Compass,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-shell";

const pillars = [
  [
    Compass,
    "U.S. market discovery",
    "Move from NASDAQ and NYSE discovery to focused company research.",
  ],
  [
    Activity,
    "Tradex Signal",
    "Understand the momentum and trend factors behind each technical score.",
  ],
  [
    ChartNoAxesCombined,
    "Portfolio intelligence",
    "Connect saved acquisition costs with current market values and exposure.",
  ],
  [
    BellRing,
    "Smart alerts",
    "Track price and technical conditions on a deliberate schedule.",
  ],
  [
    Layers3,
    "Premium research",
    "Build a repeatable research workspace around evidence, not noise.",
  ],
  [
    Sparkles,
    "Tradex Insights",
    "Editorial market context designed to complement your own analysis.",
  ],
] as const;

export default function Home() {
  return (
    <main id="main-content" className="marketing-page landing-v2">
      <MarketingHeader />
      <section className="launch-hero">
        <div>
          <span className="launch-pill">CONNECTED MARKET INTELLIGENCE</span>
          <h1>U.S. market intelligence for modern investors.</h1>
          <p>
            Research connected markets, understand technical signals and see
            your portfolio in one clear workspace.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/signup">
              Create account <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/markets">
              Explore markets
            </Link>
          </div>
          <span className="hero-caption">
            Research with context. Decide with clarity.
          </span>
        </div>
        <div className="product-preview" aria-label="Tradex product showcase">
          <div className="preview-top">
            <span>
              <i /> MARKET RESEARCH
            </span>
            <strong>Tradex Signal</strong>
          </div>
          <div className="preview-instrument">
            <span className="symbol-mark large">TX</span>
            <div>
              <small>CONNECTED RESEARCH</small>
              <h2>One instrument. One coherent view.</h2>
              <p>Quote · History · Factors · Portfolio context</p>
            </div>
          </div>
          <div className="preview-chart" aria-hidden="true">
            <svg viewBox="0 0 600 160">
              <path d="M0 135 L55 122 L105 130 L155 86 L205 100 L255 67 L305 75 L355 37 L405 53 L455 31 L505 48 L555 17 L600 25" />
            </svg>
          </div>
          <div className="preview-footer">
            <span>PRICE CONTEXT</span>
            <span>EXPLAINABLE FACTORS</span>
            <span>SAVED WORKSPACE</span>
          </div>
        </div>
      </section>
      <section className="launch-section-head">
        <p className="eyebrow">THE TRADEX WORKSPACE</p>
        <h2>Every decision deserves better context.</h2>
        <p>
          Connected tools that keep research, monitoring and portfolio
          perspective together.
        </p>
      </section>
      <section className="launch-pillars">
        {pillars.map(([Icon, title, description]) => (
          <article key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>
      <section className="pricing-teaser">
        <div>
          <p className="eyebrow">TRADEX FREE · PLUS · PRO</p>
          <h2>Start with the market. Grow into deeper intelligence.</h2>
          <p>
            Tradex Free opens the core workspace. Plus and Pro are preparing
            expanded research, insights and analytics.
          </p>
        </div>
        <Link href="/pricing" className="button secondary">
          Compare plans <ArrowRight size={15} />
        </Link>
      </section>
      <section className="launch-cta">
        <ShieldCheck size={25} />
        <div>
          <h2>Clarity before conviction.</h2>
          <p>Create your account and build a clearer market routine.</p>
        </div>
        <Link href="/signup" className="button">
          Create account <ArrowRight size={15} />
        </Link>
      </section>
      <MarketingFooter />
    </main>
  );
}
