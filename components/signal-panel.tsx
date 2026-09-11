import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import type { Signal } from "@/lib/signals";
import { SignalBadge } from "./ui";
export function SignalPanel({ signal }: { signal: Signal | null }) {
  return (
    <section className="signal-panel">
      <div className="section-heading">
        <h2>Tradex Signal</h2>
        <Activity size={18} />
      </div>
      {signal ? (
        <>
          <div className="signal-summary">
            <SignalBadge signal={signal.signal} />
            <div className="confidence-number">
              {signal.confidence}
              <span>
                /100<small>factor score</small>
              </span>
            </div>
          </div>
          <div className="confidence-track">
            <span style={{ width: signal.confidence + "%" }} />
          </div>
          <p className="signal-explanation">{signal.explanation}</p>
          <div className="driver-heading">TECHNICAL FACTORS</div>
          <ul className="drivers">
            {signal.drivers.map((d) => (
              <li key={d.label}>
                <span className={d.value >= 0 ? "positive" : "negative"}>
                  {d.value >= 0 ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                </span>
                <span>{d.label}</span>
                <small>{Math.round(d.weight * 100)}%</small>
              </li>
            ))}
          </ul>
          <details className="methodology">
            <summary>How the score works</summary>
            <p>
              Momentum and moving-average factors are weighted 30/30/20/20.
              Historical volatility moderates the score. Calculated from daily
              closing prices through {signal.generatedAt}. This is a technical
              indicator, not a probability of profit.
            </p>
          </details>
        </>
      ) : (
        <div className="signal-unavailable">
          <Activity size={32} />
          <h3>Waiting for price history</h3>
          <p>A signal requires at least 60 valid daily observations.</p>
        </div>
      )}
    </section>
  );
}
