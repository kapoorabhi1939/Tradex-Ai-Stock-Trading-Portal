import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import Link from "next/link";
import { PlanBadge } from "./product-surfaces";

export function InsightCard({
  eyebrow,
  title,
  children,
  plan,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  plan?: "Plus" | "Pro";
}) {
  return (
    <article className="insight-card">
      <div className="insight-meta">
        <span>
          <BookOpen size={14} /> {eyebrow}
        </span>
        {plan ? (
          <PlanBadge plan={plan} />
        ) : (
          <span>
            <Clock3 size={13} /> Guide
          </span>
        )}
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
      <Link href="/pricing" className="text-link">
        Explore access <ArrowRight size={14} />
      </Link>
    </article>
  );
}
