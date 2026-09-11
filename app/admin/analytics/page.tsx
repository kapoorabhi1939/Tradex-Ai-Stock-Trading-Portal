import {
  AdminBarChart,
  AdminStatus,
  AdminTable,
} from "@/components/admin-surfaces";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
import {
  adminSummary,
  adminUsers,
  revenueTrend,
  userGrowth,
} from "@/lib/admin-demo";

export const metadata = { title: "Admin analytics" };
const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
export default function AdminAnalytics() {
  const mix = [
    { label: "Free", value: adminSummary.freeUsers, percent: 82.8 },
    { label: "Plus", value: adminSummary.plusSubscribers, percent: 12.7 },
    { label: "Pro", value: adminSummary.proSubscribers, percent: 4.5 },
  ] as const;
  return (
    <>
      <PageHeading
        eyebrow="ADMIN / ANALYTICS"
        title="Product intelligence."
        description="Track U.S. customer growth, subscription mix and recurring revenue."
      />
      <div className="admin-chart-grid">
        <AdminBarChart
          title="User growth"
          sub="Registered accounts, six months"
          values={userGrowth}
          valueLabel={(value) => compact.format(value)}
        />
        <AdminBarChart
          title="Revenue trend"
          sub="Monthly recurring revenue"
          values={revenueTrend}
          valueLabel={(value) => `$${compact.format(value)}`}
        />
      </div>
      <div className="admin-analytics-grid">
        <Panel>
          <SectionTitle
            title="Subscription mix"
            sub={`${adminSummary.totalUsers.toLocaleString("en-US")} total accounts`}
          />
          <div className="subscription-mix">
            {mix.map((item) => (
              <div key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>
                    {item.value.toLocaleString("en-US")} · {item.percent}%
                  </span>
                </div>
                <div className="mix-track">
                  <i style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="admin-table-panel">
          <SectionTitle
            title="Recent signups"
            sub="Latest representative accounts"
          />
          <AdminTable
            label="Recent signup activity"
            headings={["User", "Plan", "Status"]}
          >
            {adminUsers.slice(0, 5).map((user) => (
              <tr key={user.email}>
                <td>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </td>
                <td>{user.plan}</td>
                <td>
                  <AdminStatus>{user.status}</AdminStatus>
                </td>
              </tr>
            ))}
          </AdminTable>
        </Panel>
      </div>
    </>
  );
}
