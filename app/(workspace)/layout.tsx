import { Shell } from "@/components/shell";
import { getAccount } from "@/lib/workspace";
import { isAdminEmail } from "@/lib/admin";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getAccount();
  return (
    <Shell
      email={data.email}
      displayName={data.displayName}
      admin={isAdminEmail(data.email)}
    >
      {children}
    </Shell>
  );
}
