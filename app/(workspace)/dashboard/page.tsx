import Link from "next/link";
import { ArrowUpRight, Bell, ShieldCheck } from "lucide-react";
import { getWorkspace } from "@/lib/workspace";
import { equities } from "@/lib/demo-market";
import { analyzePortfolio } from "@/lib/portfolio";
import { money } from "@/lib/format";
import {
  Panel,
  PageHeading,
  SectionTitle,
  Stat,
  Change,
  EmptyState,
} from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { DashboardChart } from "@/components/dashboard-chart";
import { Watchlist } from "@/components/watchlist";
export const metadata = { title: "Overview" };
export default async function Dashboard() {
  const data = await getWorkspace();
  const portfolio = analyzePortfolio(data.holdings);
  const name = data.displayName || data.email.split("@")[0];
  return (
    <>
      <PageHeading
        eyebrow="YOUR MARKET, IN PERSPECTIVE"
        title={`Welcome back, ${name}.`}
        description="A clearer view of the companies you follow and the risks you hold."
      >
        <Link className="button secondary" href="/research">
          Explore equities <ArrowUpRight size={16} />
        </Link>
      </PageHeading>
      <div className="market-ribbon">
        {equities.slice(0, 4).map((e) => (
          <Link
            href={`/research/${e.ticker}`}
            className="market-tile"
            key={e.ticker}
          >
            <div>
              <span>
                {e.ticker}
                <small>{e.sector}</small>
              </span>
              <Sparkline bars={e.bars} positive={e.change >= 0} />
            </div>
            <div>
              <strong>{money(e.price)}</strong>
              <Change value={e.change} />
            </div>
          </Link>
        ))}
      </div>
      <DashboardChart />
      <div className="lower-grid">
        <Panel>
          <SectionTitle
            title="Your watchlist"
            sub={`${data.watchlist.length} equities · Saved to your account`}
            href="/research"
            link="Discover"
          />
          <Watchlist items={data.watchlist} />
        </Panel>
        <div className="stack">
          <Panel>
            <SectionTitle
              title="Portfolio at a glance"
              href="/portfolio"
              link="Analyze"
            />
            {portfolio.total ? (
              <>
                <div className="stats-row two">
                  <Stat
                    label="Demo market value"
                    value={money(portfolio.total)}
                    detail={`${data.holdings.length} positions`}
                  />
                  <Stat
                    label="Risk indicator"
                    value={
                      <>
                        {portfolio.risk}
                        <small>/100</small>
                      </>
                    }
                    detail="Higher means more risk"
                  />
                </div>
                <div className="insight-note">
                  <ShieldCheck size={18} />
                  <p>
                    {portfolio.flags[0] ??
                      "Your holdings span multiple exposures. Keep reviewing concentration as allocations change."}
                  </p>
                </div>
              </>
            ) : (
              <EmptyState
                title="See the whole picture"
                href="/portfolio"
                link="Add your first holding"
              >
                Build a portfolio to reveal allocation, concentration, and risk
                indicators.
              </EmptyState>
            )}
          </Panel>
          <Panel>
            <SectionTitle
              title="Alert activity"
              sub={`${data.rules.filter((r) => r.enabled).length} enabled rules · Manual evaluation`}
              href="/alerts"
            />
            {data.activity.length ? (
              <div className="activity-compact">
                {data.activity.slice(0, 2).map((a) => (
                  <div key={a.id}>
                    <Bell size={16} />
                    <p>
                      {a.message}
                      <small>
                        {new Date(a.triggered_at).toLocaleString("en-US", {
                          timeZone: "UTC",
                        })}{" "}
                        UTC
                      </small>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="quiet-state">
                <Bell size={20} />
                <p>
                  No triggered alerts yet.
                  <br />
                  <Link href="/alerts">
                    Create a rule and evaluate the demo snapshot.
                  </Link>
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
