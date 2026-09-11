import { Bell, Database, LockKeyhole, MapPin, UserRound } from "lucide-react";
import { PageHeading, Panel, SectionTitle } from "@/components/ui";
export const metadata = { title: "Admin settings" };
const settings = [
  {
    icon: UserRound,
    title: "Admin profile",
    detail: "Authorized operations workspace",
    value: "Configured",
  },
  {
    icon: MapPin,
    title: "Platform",
    detail: "Default market",
    value: "United States",
  },
  {
    icon: Database,
    title: "Market data",
    detail: "Default currency",
    value: "USD",
  },
  {
    icon: Bell,
    title: "Notifications",
    detail: "Operational summaries",
    value: "Manual",
  },
  {
    icon: LockKeyhole,
    title: "Security",
    detail: "Server-side email allowlist",
    value: "Enforced",
  },
] as const;
export default function AdminSettings() {
  return (
    <>
      <PageHeading
        eyebrow="ADMIN / SETTINGS"
        title="Console settings."
        description="Review platform defaults and the current administrative security posture."
      />
      <Panel>
        <SectionTitle
          title="Administrative configuration"
          sub="Read-only presentation of current defaults"
        />
        <div className="admin-settings-list">
          {settings.map(({ icon: Icon, title, detail, value }) => (
            <div key={title}>
              <span className="admin-setting-icon">
                <Icon size={18} />
              </span>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
