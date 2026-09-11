import { getEquity, DATASET_VERSION } from "../demo-market";
import { calculateSignal } from "../signals";
export const conditions = {
  price_above: "Price above",
  price_below: "Price below",
  confidence_above: "Confidence above",
  confidence_below: "Confidence below",
  signal_bullish: "Signal becomes bullish",
  signal_bearish: "Signal becomes bearish",
} as const;
export type Condition = keyof typeof conditions;
export type AlertRule = {
  id: string;
  ticker: string;
  condition_type: Condition;
  threshold: number | null;
  enabled: boolean;
};
export type TriggeredAlert = {
  id: string;
  ticker: string;
  message: string;
  triggered_at: string;
};
export function evaluateRule(rule: AlertRule) {
  const e = getEquity(rule.ticker);
  if (!e || !rule.enabled) return null;
  const signal = calculateSignal(e);
  let matches = false;
  let value = e.price;
  switch (rule.condition_type) {
    case "price_above":
      matches = rule.threshold !== null && e.price > rule.threshold;
      break;
    case "price_below":
      matches = rule.threshold !== null && e.price < rule.threshold;
      break;
    case "confidence_above":
      value = signal.confidence;
      matches = rule.threshold !== null && value > rule.threshold;
      break;
    case "confidence_below":
      value = signal.confidence;
      matches = rule.threshold !== null && value < rule.threshold;
      break;
    case "signal_bullish":
      value = signal.score;
      matches = signal.signal === "bullish";
      break;
    case "signal_bearish":
      value = signal.score;
      matches = signal.signal === "bearish";
      break;
  }
  return matches
    ? {
        trigger_value: value,
        dataset_version: DATASET_VERSION,
        message: `${e.ticker}: ${conditions[rule.condition_type]}${rule.threshold === null ? "" : ` ${rule.threshold}`} matched. Reference price $${e.price.toFixed(2)}; ${signal.signal} indication, ${signal.confidence}% confidence.`,
      }
    : null;
}
