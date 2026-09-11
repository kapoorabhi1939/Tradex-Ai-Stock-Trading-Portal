import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { PlanName } from "@/lib/plans";

export function PlanBadge({ plan = "Free" }: { plan?: PlanName }) {
  return (
    <span className={`plan-badge plan-${plan.toLowerCase()}`}>{plan}</span>
  );
}

export function LockedFeature({
  title,
  plan,
  children,
}: {
  title: string;
  plan: Exclude<PlanName, "Free">;
  children?: ReactNode;
}) {
  return (
    <article className="locked-feature">
      <div className="locked-feature-head">
        <span className="locked-icon">
          <LockKeyhole size={17} />
        </span>
        <PlanBadge plan={plan} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
      <Link href="/pricing" className="text-link">
        Explore Tradex {plan} <ArrowRight size={14} />
      </Link>
    </article>
  );
}

export function UpgradePrompt({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`upgrade-prompt ${compact ? "compact" : ""}`}>
      <Sparkles size={19} />
      <div>
        <strong>Go deeper with Tradex Plus</strong>
        <p>
          Compare plans for expanded signals, insights and deeper U.S. market
          research.
        </p>
      </div>
      <Link href="/pricing" className="button secondary small-button">
        Compare plans
      </Link>
    </aside>
  );
}

export function PlanFeatures({ features }: { features: readonly string[] }) {
  return (
    <ul className="plan-features">
      {features.map((feature) => (
        <li key={feature}>
          <Check size={15} /> {feature}
        </li>
      ))}
    </ul>
  );
}
