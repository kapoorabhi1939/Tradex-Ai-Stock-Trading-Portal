import { getWorkspace } from "@/lib/workspace";
import { market } from "@/lib/market-data/provider";
import { PageHeading } from "@/components/ui";
import { PortfolioManager } from "@/components/portfolio-manager";
export const metadata = { title: "Portfolio" };
export default async function Portfolio() {
  const data = await getWorkspace(),
    quotes = await market.quotes(data.holdings.map((h) => h.ticker));
  return (
    <>
      <PageHeading
        eyebrow="PORTFOLIO"
        title="Know your position."
        description="Your holdings, current value and exposure in one view."
      />
      <PortfolioManager holdings={data.holdings} quotes={quotes} />
    </>
  );
}
