import { AdminMetric } from "@/components/admin-surfaces";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
import { adminSummary } from "@/lib/admin-demo";

export const metadata = { title: "Admin overview" };
const number = new Intl.NumberFormat("en-US");
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function AdminOverview() {
  const metrics = [
    [
      "Total users",
      number.format(adminSummary.totalUsers),
      "All registered accounts",
    ],
    [
      "Active users",
      number.format(adminSummary.activeUsers),
      "Current 30-day activity",
    ],
    [
      "Paid subscribers",
      number.format(adminSummary.paidSubscribers),
      "Plus and Pro accounts",
    ],
    ["Free users", number.format(adminSummary.freeUsers), "Core plan accounts"],
    [
      "Plus subscribers",
      number.format(adminSummary.plusSubscribers),
      "$9.99 monthly plan",
    ],
    [
      "Pro subscribers",
      number.format(adminSummary.proSubscribers),
      "$19.99 monthly plan",
    ],
    [
      "Monthly revenue",
      currency.format(adminSummary.monthlyRevenue),
      "Current recurring revenue",
    ],
    [
      "New users — 30 days",
      number.format(adminSummary.newUsers30Days),
      "Recent account growth",
    ],
    [
      "Published insights",
      number.format(adminSummary.publishedInsights),
      "Editorial library",
    ],
    [
      "Active alerts",
      number.format(adminSummary.activeAlerts),
      "Enabled market rules",
    ],
  ] as const;
  return (
    <>
      <PageHeading
        eyebrow="OPERATIONS / OVERVIEW"
        title="Tradex operations."
        description="A concise view of U.S. customer growth, subscriptions and platform activity."
      />
      <div className="admin-metrics">
        {metrics.map(([label, value, detail]) => (
          <AdminMetric
            key={label}
            label={label}
            value={value}
            detail={detail}
          />
        ))}
      </div>
      <Panel>
        <SectionTitle
          title="Platform snapshot"
          sub="Current operating posture"
        />
        <div className="readiness-list">
          <div>
            <strong>Primary market</strong>
            <span>United States</span>
          </div>
          <div>
            <strong>Default currency</strong>
            <span>USD</span>
          </div>
          <div>
            <strong>Market data</strong>
            <span>Available</span>
          </div>
          <div>
            <strong>Insight workflow</strong>
            <span>Editorial review</span>
          </div>
        </div>
      </Panel>
    </>
  );
}
