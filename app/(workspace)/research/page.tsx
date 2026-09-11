import Link from "next/link";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
import { InstrumentSearch } from "@/components/instrument-search";
import { getWorkspace } from "@/lib/workspace";
export const metadata = { title: "Research" };
export default async function Research() {
  const data = await getWorkspace();
  return (
    <>
      <PageHeading
        eyebrow="RESEARCH"
        title="Find your next perspective."
        description="Search instruments across equities, ETFs, currencies and digital assets."
      />
      <Panel className="research-discovery">
        <span className="eyebrow">EXPLORE THE MARKETS</span>
        <h2>Every idea starts with a closer look.</h2>
        <InstrumentSearch />
        <p className="muted">
          Search by company name or symbol. Available markets depend on the
          connected data service.
        </p>
      </Panel>
      <Panel>
        <SectionTitle
          title="Your research shortcuts"
          sub="Continue with a saved instrument"
        />
        <div className="discovery-links">
          {(data.watchlist.length
            ? data.watchlist.map((i) => i.ticker)
            : ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA"]
          ).map((s) => (
            <Link key={s} href={"/research/" + s} prefetch={false}>
              <span className="symbol-mark">{s.slice(0, 2)}</span>
              <strong>{s}</strong>
              <span>Open research ↗</span>
            </Link>
          ))}
        </div>
      </Panel>
    </>
  );
}
