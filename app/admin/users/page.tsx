import { AdminStatus, AdminTable } from "@/components/admin-surfaces";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
import { adminUsers } from "@/lib/admin-demo";

export const metadata = { title: "Admin users" };
export default function AdminUsers() {
  return (
    <>
      <PageHeading
        eyebrow="ADMIN / USERS"
        title="User operations."
        description="Review a compact presentation of customer plans and account status."
      />
      <Panel className="admin-table-panel">
        <SectionTitle
          title="Recent accounts"
          sub={`${adminUsers.length} representative customer records`}
        />
        <AdminTable
          label="Recent user accounts"
          headings={["User", "Email", "Plan", "Joined", "Status"]}
        >
          {adminUsers.map((user) => (
            <tr key={user.email}>
              <td>
                <strong>{user.name}</strong>
              </td>
              <td>{user.email}</td>
              <td>
                <span className={`plan-badge plan-${user.plan.toLowerCase()}`}>
                  {user.plan}
                </span>
              </td>
              <td>{user.joined}</td>
              <td>
                <AdminStatus>{user.status}</AdminStatus>
              </td>
            </tr>
          ))}
        </AdminTable>
      </Panel>
    </>
  );
}
