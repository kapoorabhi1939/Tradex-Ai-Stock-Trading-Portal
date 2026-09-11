import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Activity,
} from "lucide-react";
import type { ReactNode } from "react";
import type { SignalDirection } from "@/lib/signals";
import { percent } from "@/lib/format";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Tradex AI home">
      <span className="brand-mark">
        <Activity size={23} />
      </span>
      <span>
        tradex<span className="brand-ai"> AI</span>
      </span>
    </Link>
  );
}
export function DemoBadge() {
  return (
    <span className="demo-badge">
      <span /> Market research
    </span>
  );
}
export function Change({ value }: { value: number }) {
  return (
    <span className={`change ${value >= 0 ? "positive" : "negative"}`}>
      {value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{" "}
      {percent(value)}
    </span>
  );
}
export function SignalBadge({ signal }: { signal: SignalDirection }) {
  return (
    <span className={`signal-badge ${signal}`}>
      {signal === "bullish" ? "↗" : signal === "bearish" ? "↘" : "→"} {signal}
    </span>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}
export function SectionTitle({
  title,
  sub,
  href,
  link = "View all",
}: {
  title: string;
  sub?: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      {detail && <span className="stat-detail">{detail}</span>}
    </div>
  );
}
export function EmptyState({
  title,
  children,
  href,
  link,
}: {
  title: string;
  children: ReactNode;
  href?: string;
  link?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Activity size={24} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {href && (
        <Link href={href} className="button secondary">
          {link}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
export function Disclaimer() {
  return (
    <p className="disclaimer">
      Market information is for informational purposes and is not investment
      advice.
    </p>
  );
}
