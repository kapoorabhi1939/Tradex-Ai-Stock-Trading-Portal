"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Search,
  ChartPie,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Brand, DemoBadge, Disclaimer } from "./ui";
import { ActionForm } from "./action-form";
import { signOut } from "@/app/actions/auth";
const links = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/research", "Equity research", Search],
  ["/portfolio", "My portfolio", ChartPie],
  ["/alerts", "Alerts center", Bell],
  ["/settings", "Settings", Settings],
] as const;
export function Shell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    const media = window.matchMedia("(max-width: 760px)");
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          "a[href],button:not(:disabled)",
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable(),
        first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onResize = () => {
      if (!media.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onResize);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  return (
    <div className="app-shell">
      <aside
        ref={sidebarRef}
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-only"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav>
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-item ${pathname.startsWith(href) ? "active" : ""}`}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
              {pathname.startsWith(href) && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <ShieldCheck size={21} />
            <h3>Clarity before conviction.</h3>
            <p>
              Explore the evidence. Understand your exposure. Decide
              thoughtfully.
            </p>
            <Link href="/research" onClick={() => setOpen(false)}>
              Start researching <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="account">
            <span className="avatar">{email.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>Your workspace</strong>
              <span title={email}>{email}</span>
            </div>
          </div>
          <ActionForm
            action={signOut}
            label={
              <>
                <LogOut size={16} />
                Sign out
              </>
            }
            pendingLabel="Signing out…"
            buttonClass="sidebar-signout"
          />
        </div>
      </aside>
      {open && (
        <button
          className="nav-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-only"
              ref={menuRef}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label="Open navigation"
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span>{" "}
              <strong>
                {links.find(([href]) => pathname.startsWith(href))?.[1] ??
                  "Research"}
              </strong>
            </span>
          </div>
          <div className="topbar-right">
            <DemoBadge />
            <span className="snapshot-label">Snapshot · Sep 09, 2026</span>
            <Link
              href="/alerts"
              className="icon-button"
              aria-label="Open alerts center"
            >
              <Bell size={19} />
            </Link>
          </div>
        </header>
        <main id="main-content" className="workspace-content">
          {children}
          <Disclaimer />
        </main>
      </div>
    </div>
  );
}
