import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tradex AI",
  description: "Decision-support stock analytics portal with explainable signals, sentiment, and risk intelligence."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <header className="topbar">
            <div className="brand">
              <span className="brand-kicker">AI Stock Portal</span>
              <span className="brand-name">Tradex AI</span>
            </div>
            <nav className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/positions">Positions</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/alerts">Alerts</Link>
              <Link href="/auth">Auth</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
