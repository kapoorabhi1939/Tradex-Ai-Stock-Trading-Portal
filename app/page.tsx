import Link from "next/link";
import {
  ArrowUpRight,
  Activity,
  ChartNoAxesCombined,
  ShieldCheck,
} from "lucide-react";
import { Brand, Disclaimer } from "@/components/ui";
export default function Home() {
  return (
    <main id="main-content" className="landing">
      <header className="marketing-nav">
        <Brand />
        <Link href="/login" className="button secondary">
          Sign in <ArrowUpRight size={16} />
        </Link>
      </header>
      <section className="premium-hero">
        <div>
          <span className="eyebrow">PERSPECTIVE IS YOUR EDGE</span>
          <h1>
            Less noise.
            <br />
            More conviction.
          </h1>
          <p>
            Connect market research, technical signals and your portfolio in one
            focused workspace.
          </p>
          <Link className="button" href="/login">
            Open your workspace <ArrowUpRight size={17} />
          </Link>
          <span className="hero-caption">
            Research with context. Decide with clarity.
          </span>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit" />
          <div className="art-axis" />
          <Activity size={110} />
          <span>TRADEX</span>
          <small>MARKET INTELLIGENCE / PERSONAL PERSPECTIVE</small>
        </div>
      </section>
      <section className="product-pillars">
        {[
          [
            ChartNoAxesCombined,
            "Market perspective",
            "Explore current quotes and price histories across connected markets.",
          ],
          [
            Activity,
            "Explainable signals",
            "See the momentum and trend factors behind each technical score.",
          ],
          [
            ShieldCheck,
            "Your portfolio, connected",
            "Track acquisition costs, market values and position concentration.",
          ],
        ].map(([Icon, title, description]) => {
          const I = Icon as typeof Activity;
          return (
            <article key={String(title)}>
              <I size={23} />
              <h2>{String(title)}</h2>
              <p>{String(description)}</p>
            </article>
          );
        })}
      </section>
      <Disclaimer />
    </main>
  );
}
