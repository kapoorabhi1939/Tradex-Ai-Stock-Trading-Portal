import { getWorkspace } from "@/lib/workspace";
import { PageHeading } from "@/components/ui";
import { AlertsManager } from "@/components/alerts-manager";
export const metadata = { title: "Alerts center" };
export default async function Alerts() {
  const data = await getWorkspace();
  return (
    <>
      <PageHeading
        eyebrow="ALERTS / CONDITIONS THAT MATTER"
        title="Stay close to your thesis."
        description="Save research conditions and evaluate them against the demonstration dataset."
      />
      <AlertsManager rules={data.rules} activity={data.activity} />
    </>
  );
}
