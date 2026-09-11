import {
  AdminMetric,
  AdminStatus,
  AdminTable,
} from "@/components/admin-surfaces";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
import { adminSummary, subscriptionActivity } from "@/lib/admin-demo";

export const metadata = { title: "Admin subscriptions" };
const number = new Intl.NumberFormat("en-US");
export default function AdminSubscriptions() {
  const metrics = [
    ["Free", number.format(adminSummary.freeUsers), "Core plan accounts"],
    ["Plus", number.format(adminSummary.plusSubscribers), "$9.99 / month"],
    ["Pro", number.format(adminSummary.proSubscribers), "$19.99 / month"],
    ["MRR", "$31,824", "Monthly recurring revenue"],
  ] as const;
  return (
    <>
      <PageHeading
        eyebrow="ADMIN / SUBSCRIPTIONS"
        title="Plan operations."
        description="Monitor the customer plan mix and recent subscription movement."
      />
      <div className="admin-metrics admin-metrics-four">
        {metrics.map(([label, value, detail]) => (
          <AdminMetric
            key={label}
            label={label}
            value={value}
            detail={detail}
          />
        ))}
      </div>
      <Panel className="admin-table-panel">
        <SectionTitle
          title="Recent plan activity"
          sub="Latest account movements"
        />
        <AdminTable
          label="Recent subscription activity"
          headings={["Account", "Activity", "Plan", "Date"]}
        >
          {subscriptionActivity.map((item) => (
            <tr key={`${item.account}-${item.date}`}>
              <td>
                <strong>{item.account}</strong>
              </td>
              <td>
                <AdminStatus>{item.event}</AdminStatus>
              </td>
              <td>{item.plan}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </AdminTable>
      </Panel>
    </>
  );
}
