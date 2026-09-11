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
        description="Track price and technical conditions across your saved instruments."
      />
      <AlertsManager rules={data.rules} activity={data.activity} />
    </>
  );
}
