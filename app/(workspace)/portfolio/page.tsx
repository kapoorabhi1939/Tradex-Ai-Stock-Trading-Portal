import { getWorkspace } from "@/lib/workspace";
import { PageHeading } from "@/components/ui";
import { PortfolioManager } from "@/components/portfolio-manager";
export const metadata = { title: "My portfolio" };
export default async function Portfolio() {
  const data = await getWorkspace();
  return (
    <>
      <PageHeading
        eyebrow="PORTFOLIO / EXPOSURE & BALANCE"
        title="Understand what you hold."
        description="Your positions, connected to a clearer picture of allocation and risk."
      />
      <PortfolioManager holdings={data.holdings} />
    </>
  );
}
