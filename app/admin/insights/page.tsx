import { AdminStatus, AdminTable } from "@/components/admin-surfaces";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
import { adminInsights } from "@/lib/admin-demo";
export const metadata = { title: "Admin insights" };
export default function AdminInsights() {
  return (
    <>
      <PageHeading
        eyebrow="ADMIN / INSIGHTS"
        title="Insight publishing."
        description="Review editorial coverage and prepare U.S. market context for each audience."
      />
      <Panel className="admin-table-panel">
        <SectionTitle
          title="Editorial queue"
          sub="Published and draft market context"
        />
        <AdminTable
          label="Editorial insights"
          headings={["Symbol", "Headline", "Audience", "Status", "Date"]}
        >
          {adminInsights.map((item) => (
            <tr key={`${item.symbol}-${item.headline}`}>
              <td>
                <strong>{item.symbol}</strong>
              </td>
              <td>{item.headline}</td>
              <td>{item.audience}</td>
              <td>
                <AdminStatus>{item.status}</AdminStatus>
              </td>
              <td>{item.date}</td>
            </tr>
          ))}
        </AdminTable>
      </Panel>
      <Panel className="admin-composer-panel">
        <SectionTitle
          title="Compose an insight"
          sub="Draft market context for editorial review"
        />
        <fieldset className="insight-composer">
          <label>
            Symbol
            <input placeholder="e.g. AAPL" />
          </label>
          <label>
            Audience
            <select defaultValue="all">
              <option value="all">All users</option>
              <option>Free</option>
              <option>Plus</option>
              <option>Pro</option>
            </select>
          </label>
          <label className="wide">
            Headline
            <input placeholder="A concise, factual headline" />
          </label>
          <label className="wide">
            Insight
            <textarea placeholder="Editorial market context" rows={5} />
          </label>
          <div className="wide composer-actions">
            <button type="button" className="button secondary" disabled>
              Save draft
            </button>
            <button type="button" className="button" disabled>
              Publish
            </button>
            <span>Publishing controls are presentation-only.</span>
          </div>
        </fieldset>
      </Panel>
    </>
  );
}
