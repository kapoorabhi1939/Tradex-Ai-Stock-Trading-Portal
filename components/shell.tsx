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
  PanelsTopLeft,
  BookOpen,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { InstrumentSearch } from "./instrument-search";
import { Brand, DemoBadge, Disclaimer } from "./ui";
import { ActionForm } from "./action-form";
import { signOut } from "@/app/actions/auth";
import { PlanBadge } from "./product-surfaces";
import { accountDestinations } from "@/lib/navigation";
import { maskedEmail } from "@/lib/format";
const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/markets", "Markets", PanelsTopLeft],
  ["/research", "Research", Search],
  ["/insights", "Insights", BookOpen],
  ["/portfolio", "Portfolio", ChartPie],
  ["/alerts", "Alerts", Bell],
  ["/settings", "Settings", Settings],
] as const;
export function Shell({
  email,
  displayName,
  admin = false,
  children,
}: {
  email: string;
  displayName?: string;
  admin?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const accountEmail = maskedEmail(email);
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeAccountMenu = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        accountMenuRef.current?.removeAttribute("open");
      }
    };
    document.addEventListener("pointerdown", closeAccountMenu);
    return () => document.removeEventListener("pointerdown", closeAccountMenu);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    const media = window.matchMedia("(max-width: 760px)");
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          "a[href],button:not(:disabled),summary",
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    focusable()[0]?.focus();
    const focusFrame = requestAnimationFrame(() => focusable()[0]?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = accountMenuRef.current?.open
        ? accountMenuRef.current.querySelector<HTMLElement>(".sidebar-signout")
        : accountMenuRef.current?.querySelector<HTMLElement>("summary");
      if (!sidebarRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
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
    document.addEventListener("keydown", onKeyDown, true);
    media.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
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
          <details
            ref={accountMenuRef}
            className="account-menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.currentTarget.removeAttribute("open");
                event.currentTarget.querySelector("summary")?.focus();
              }
            }}
          >
            <summary className="account">
              <span className="avatar">{email.slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{displayName || "Your workspace"}</strong>
                <span title="Signed-in account">{accountEmail}</span>
              </div>
              <PlanBadge />
            </summary>
            <div className="account-popover">
              <div>
                <strong>{displayName || "Tradex account"}</strong>
                <span>{accountEmail}</span>
              </div>
              <PlanBadge />
              {accountDestinations(admin).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <ActionForm
                action={signOut}
                label={
                  <>
                    <LogOut size={15} /> Sign out
                  </>
                }
                pendingLabel="Signing out…"
                buttonClass="sidebar-signout"
              />
            </div>
          </details>
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
            <InstrumentSearch />
          </div>
          <div className="topbar-right">
            <DemoBadge />
            <span className="snapshot-label">Your market workspace</span>
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
