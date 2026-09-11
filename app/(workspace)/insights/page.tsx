import { InsightCard } from "@/components/insight-card";
import { LockedFeature, UpgradePrompt } from "@/components/product-surfaces";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";

export const metadata = { title: "Tradex Insights" };

export default function Insights() {
  return (
    <>
      <PageHeading
        eyebrow="TRADEX INSIGHTS"
        title="Perspective for better decisions."
        description="Research workflows and market context, designed to complement your own analysis."
      />
      <div className="insights-grid">
        <InsightCard
          eyebrow="RESEARCH PRACTICE"
          title="Build a thesis before watching the price"
        >
          Start with the instrument, time horizon and evidence that would change
          your view. Use alerts to revisit the thesis rather than chase every
          move.
        </InsightCard>
        <InsightCard
          eyebrow="PORTFOLIO PRACTICE"
          title="Read concentration before conviction"
          plan="Plus"
        >
          Position size changes the meaning of every idea. Compare current
          allocation with the risk you intended to take.
        </InsightCard>
        <InsightCard
          eyebrow="SIGNAL PRACTICE"
          title="Use factor agreement as context"
          plan="Pro"
        >
          Momentum and trend can agree or conflict. The factor breakdown
          explains that relationship without promising an outcome.
        </InsightCard>
      </div>
      <Panel>
        <SectionTitle
          title="Latest market insights"
          sub="Editorial market coverage will appear here as it is published."
        />
        <div className="insight-empty">
          <p className="eyebrow">NO NEW INSIGHTS</p>
          <h3>Your research workspace is up to date.</h3>
          <p>
            No actionable market commentary has been published. Tradex never
            invents analyst calls to fill this space.
          </p>
        </div>
      </Panel>
      <div className="locked-grid">
        <LockedFeature title="Premium market intelligence" plan="Plus">
          Timely editorial context for supported markets.
        </LockedFeature>
        <LockedFeature title="Advanced portfolio analytics" plan="Pro">
          Deeper exposure and portfolio research tools.
        </LockedFeature>
      </div>
      <UpgradePrompt />
    </>
  );
}
