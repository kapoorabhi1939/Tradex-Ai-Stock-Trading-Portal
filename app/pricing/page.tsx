import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-shell";
import { PlanBadge, PlanFeatures } from "@/components/product-surfaces";
import { plans } from "@/lib/plans";

export const metadata = { title: "Pricing" };

export default function Pricing() {
  return (
    <main id="main-content" className="marketing-page">
      <MarketingHeader />
      <section className="pricing-hero">
        <p className="eyebrow">PRICING / PLANS</p>
        <h1>Start clear. Go deeper when you need to.</h1>
        <p>Choose the research depth that fits your market routine.</p>
      </section>
      <section className="pricing-grid" aria-label="Tradex plans">
        {plans.map((plan) => (
          <article
            className={
              "pricing-card " +
              ("recommended" in plan && plan.recommended ? "recommended" : "")
            }
            key={plan.name}
          >
            <div className="pricing-card-top">
              <PlanBadge plan={plan.name} />
              {"recommended" in plan && plan.recommended && (
                <span className="recommended-label">MOST POPULAR</span>
              )}
            </div>
            <h2>{plan.name}</h2>
            <p>{plan.audience}</p>
            <div className="plan-price-row">
              <strong className="plan-price">{plan.price}</strong>
              <span>{plan.period}</span>
            </div>
            <PlanFeatures features={plan.features} />
            <Link
              href={
                plan.name === "Free"
                  ? "/signup"
                  : "/signup?plan=" + plan.name.toLowerCase()
              }
              className={"button " + (plan.name === "Free" ? "secondary" : "")}
            >
              {plan.name === "Free" ? "Get started" : "Choose " + plan.name}{" "}
              <ArrowRight size={15} />
            </Link>
          </article>
        ))}
      </section>
      <section className="plan-comparison">
        <div>
          <p className="eyebrow">PLAN COMPARISON</p>
          <h2>Built for every stage of your market routine.</h2>
        </div>
        <div className="comparison-row">
          <span>Market research</span>
          <strong>Free</strong>
          <strong>Plus</strong>
          <strong>Pro</strong>
        </div>
        <div className="comparison-row">
          <span>Tradex Signal</span>
          <strong>Core</strong>
          <strong>Expanded</strong>
          <strong>Expanded</strong>
        </div>
        <div className="comparison-row">
          <span>Tradex Insights</span>
          <strong>Preview</strong>
          <strong>Included</strong>
          <strong>Premium</strong>
        </div>
        <div className="comparison-row">
          <span>Portfolio intelligence</span>
          <strong>Core</strong>
          <strong>Expanded</strong>
          <strong>Advanced</strong>
        </div>
      </section>
      <section className="pricing-faq">
        <CircleHelp size={22} />
        <div>
          <h2>How does billing work?</h2>
          <p>
            Plan selection creates your Tradex account. Checkout and payment
            processing are not currently enabled.
          </p>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
