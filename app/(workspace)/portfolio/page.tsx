import { getHoldings } from "@/lib/workspace";
import { market } from "@/lib/market-data/provider";
import { PageHeading } from "@/components/ui";
import { PortfolioManager } from "@/components/portfolio-manager";
export const metadata = { title: "Portfolio" };
export default async function Portfolio() {
  const holdings = await getHoldings();
  const quotes = await market.quotes(holdings.map((holding) => holding.ticker));
  return (
    <>
      <PageHeading
        eyebrow="PORTFOLIO"
        title="Know your position."
        description="Your holdings, current value and exposure in one view."
      />
      <PortfolioManager holdings={holdings} quotes={quotes} />
    </>
  );
}
