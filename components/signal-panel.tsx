import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import type { Equity } from "@/lib/demo-market";
import { calculateSignal } from "@/lib/signals";
import { SignalBadge } from "./ui";
export function SignalPanel({ equity }: { equity: Equity }) {
  const signal = calculateSignal(equity);
  return (
    <section className="signal-panel">
      <div className="section-heading">
        <h2>Signal intelligence</h2>
        <span className="model-label">BASELINE v1</span>
      </div>
      <div className="signal-summary">
        <div>
          <span className="stat-label">Decision-support signal</span>
          <SignalBadge signal={signal.signal} />
        </div>
        <div className="confidence-number">
          {signal.confidence}
          <span>
            %<small>confidence</small>
          </span>
        </div>
      </div>
      <div className="confidence-track">
        <span style={{ width: `${signal.confidence}%` }} />
      </div>
      <p className="signal-explanation">{signal.explanation}</p>
      <div className="driver-heading">WHAT’S DRIVING THE SIGNAL</div>
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
      <div className="signal-foot">
        <Info size={14} />
        <span>
          {signal.horizon}. Confidence is a heuristic score, not a probability
          of profit.
        </span>
      </div>
    </section>
  );
}
