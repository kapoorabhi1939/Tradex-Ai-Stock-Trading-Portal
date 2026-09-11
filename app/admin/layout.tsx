import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireUser } from "@/lib/auth";
import { adminConfigured, isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  if (!adminConfigured()) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(
        "Admin configuration: set TRADEX_ADMIN_EMAILS in .env.local and restart the development server.",
      );
    redirect("/dashboard?notice=admin-required");
  }
  if (!isAdminEmail(user.email)) redirect("/dashboard?notice=admin-required");
  return <AdminShell>{children}</AdminShell>;
}
