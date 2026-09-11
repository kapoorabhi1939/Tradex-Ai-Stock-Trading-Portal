"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FileText,
  Gauge,
  Settings,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Brand } from "./ui";

const items = [
  ["/admin", "Overview", Gauge],
  ["/admin/users", "Users", Users],
  ["/admin/subscriptions", "Subscriptions", CreditCard],
  ["/admin/insights", "Insights", FileText],
  ["/admin/analytics", "Analytics", BarChart3],
  ["/admin/settings", "Settings", Settings],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <p className="eyebrow">ADMIN CONSOLE</p>
        <nav aria-label="Admin navigation">
          {items.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" className="text-link">
          <ArrowLeft size={14} /> Back to workspace
        </Link>
      </aside>
      <main id="main-content" className="admin-content">
        {children}
        <p className="admin-demo-data">Demo data</p>
      </main>
    </div>
  );
}
