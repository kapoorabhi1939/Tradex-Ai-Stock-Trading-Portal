import Link from "next/link";
import {
  BarChart3,
  Bitcoin,
  CircleDollarSign,
  Gem,
  Landmark,
  TimerReset,
} from "lucide-react";
import { InstrumentSearch } from "@/components/instrument-search";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
import { marketCategories } from "@/lib/market-categories";
import { getWatchlist } from "@/lib/workspace";

export const metadata = { title: "Markets" };

const categoryIcons = {
  "U.S. Stocks": BarChart3,
  ETFs: Landmark,
  Forex: CircleDollarSign,
  Crypto: Bitcoin,
  Commodities: Gem,
  Futures: TimerReset,
} as const;

export default async function Markets() {
  const watchlist = await getWatchlist();
  return (
    <>
      <PageHeading
        eyebrow="MARKETS / U.S. DISCOVERY"
        title="Explore U.S. markets with context."
        description="Start with U.S.-listed stocks and ETFs, then explore other supported markets."
      />
      <Panel className="market-search-panel">
        <div>
          <p className="eyebrow">SEARCH MARKETS</p>
          <h2>Find a U.S. stock, ETF or supported market symbol.</h2>
        </div>
        <InstrumentSearch />
      </Panel>
      <section className="market-category-grid" aria-label="Market categories">
        {marketCategories.map((category) => {
          const Icon = categoryIcons[category.title];
          if ("comingSoon" in category) {
            return (
              <article
                className="market-category-card coming-soon"
                key={category.title}
              >
                <Icon size={21} />
                <div>
                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                  <span>{category.action}</span>
                </div>
              </article>
            );
          }
          return (
            <Link
              href={category.href}
              className="market-category-card"
              key={category.title}
            >
              <Icon size={21} />
              <div>
                <h2>{category.title}</h2>
                <p>{category.description}</p>
                <span>{category.action} →</span>
              </div>
            </Link>
          );
        })}
      </section>
      <Panel>
        <SectionTitle
          title="Your watchlist"
          sub={watchlist.length + " saved instruments"}
          href="/dashboard"
          link="Open dashboard"
        />
        <div className="symbol-link-row">
          {watchlist.length ? (
            watchlist.map((item) => (
              <Link
                key={item.id}
                href={"/research/" + encodeURIComponent(item.ticker)}
              >
                {item.ticker} <span>Research →</span>
              </Link>
            ))
          ) : (
            <p className="muted">Your saved instruments will appear here.</p>
          )}
        </div>
      </Panel>
    </>
  );
}
