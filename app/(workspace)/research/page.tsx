import { PageHeading, Stat } from "@/components/ui";
import { ResearchDirectory } from "@/components/research-directory";
import { equities } from "@/lib/demo-market";
import { calculateSignal } from "@/lib/signals";
export const metadata = { title: "Equity research" };
export default function Research() {
  const signals = equities.map(calculateSignal);
  return (
    <>
      <PageHeading
        eyebrow="RESEARCH / US EQUITIES"
        title="Find your next perspective."
        description="Explore companies, compare model indications, and understand what drives them."
      />
      <div className="research-summary">
        <Stat
          label="Research universe"
          value="12"
          detail="Recognizable US equities"
        />
        <Stat
          label="Sectors represented"
          value={new Set(equities.map((e) => e.sector)).size}
          detail="A broader market perspective"
        />
        <Stat
          label="Bullish indications"
          value={signals.filter((s) => s.signal === "bullish").length}
          detail="Calculated from baseline factors"
        />
        <Stat
          label="Dataset snapshot"
          value="09 Sep"
          detail="2026 · Fictional, fixed values"
        />
      </div>
      <ResearchDirectory />
    </>
  );
}
