import type { MarketCandle, QuoteMap, MarketQuote } from "./types";
import type { Holding } from "../portfolio";
import type { AlertRule } from "../alerts";
import type { Signal } from "../signals";
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export function technicalSignal(
  symbol: string,
  bars: MarketCandle[],
): Signal | null {
  if (
    bars.length < 60 ||
    bars.some((b) => !Number.isFinite(b.close) || b.close <= 0)
  )
    return null;
  const prices = bars.map((b) => b.close),
    current = prices.at(-1)!;
  const mean = (n: number) => prices.slice(-n).reduce((a, b) => a + b, 0) / n;
  const m5 = (current / prices.at(-6)! - 1) * 100,
    m20 = (current / prices.at(-21)! - 1) * 100,
    ma = (current / mean(20) - 1) * 100,
    trend = (mean(20) / mean(60) - 1) * 100;
  const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i])),
    avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const volatility =
    Math.sqrt(
      returns.reduce((a, b) => a + (b - avg) ** 2, 0) / returns.length,
    ) *
    Math.sqrt(252) *
    100;
  const drivers = [
    { label: "5-session momentum", value: clamp(m5 / 5, -1, 1), weight: 0.3 },
    {
      label: "20-session momentum",
      value: clamp(m20 / 12, -1, 1),
      weight: 0.3,
    },
    { label: "Price vs 20D average", value: clamp(ma / 6, -1, 1), weight: 0.2 },
    {
      label: "20D vs 60D average",
      value: clamp(trend / 8, -1, 1),
      weight: 0.2,
    },
  ];
  const score = drivers.reduce((s, d) => s + d.weight * d.value, 0),
    signal = score > 0.18 ? "bullish" : score < -0.18 ? "bearish" : "neutral";
  const agreement = drivers.reduce(
      (s, d) => s + (Math.sign(d.value) === Math.sign(score) ? d.weight : 0),
      0,
    ),
    strength =
      signal === "neutral" ? 1 - Math.abs(score) / 0.18 : Math.abs(score);
  return {
    ticker: symbol,
    signal,
    score,
    confidence: Math.round(
      clamp(45 + strength * 30 + agreement * 20 - volatility * 0.25, 0, 100),
    ),
    drivers,
    horizon: "5–20 trading sessions",
    generatedAt: bars.at(-1)!.date,
    explanation: `5-session momentum ${m5 >= 0 ? "+" : ""}${m5.toFixed(1)}%. Price is ${Math.abs(ma).toFixed(1)}% ${ma >= 0 ? "above" : "below"} its 20-session average. Annualized historical volatility of ${volatility.toFixed(1)}% moderates the score.`,
  };
}
export function valuePortfolio(holdings: Holding[], quotes: QuoteMap) {
  const positions = holdings.map((h) => {
    if (
      !Number.isFinite(h.shares) ||
      h.shares <= 0 ||
      !Number.isFinite(h.average_cost) ||
      h.average_cost < 0
    )
      throw Error("Invalid holding");
    const q = quotes[h.ticker];
    const quote = q?.data?.currency === "USD" ? q.data : null;
    const cost = h.shares * h.average_cost,
      value = quote ? h.shares * quote.price : null;
    return {
      ...h,
      quote,
      stale: q?.stale ?? false,
      cost,
      value,
      gain: value === null ? null : value - cost,
    };
  });
  const priced = positions.filter((p) => p.value !== null),
    partial = priced.length !== positions.length;
  const knownValue = priced.reduce((s, p) => s + p.value!, 0),
    cost = positions.reduce((s, p) => s + p.cost, 0),
    knownCost = priced.reduce((s, p) => s + p.cost, 0);
  return {
    positions,
    cost,
    knownValue,
    total: partial ? null : knownValue,
    gain: partial ? null : knownValue - cost,
    knownGain: knownValue - knownCost,
    partial,
    pricedCount: priced.length,
    concentration: knownValue
      ? priced.reduce((s, p) => s + (p.value! / knownValue) ** 2, 0) * 100
      : null,
  };
}
export function evaluateMarketRule(
  rule: AlertRule,
  quote: MarketQuote,
  signal: Signal | null,
) {
  if (!rule.enabled) return null;
  let value: number;
  let matches = false;
  switch (rule.condition_type) {
    case "price_above":
      value = quote.price;
      matches = rule.threshold !== null && value > rule.threshold;
      break;
    case "price_below":
      value = quote.price;
      matches = rule.threshold !== null && value < rule.threshold;
      break;
    case "confidence_above":
      if (!signal) return null;
      value = signal.confidence;
      matches = rule.threshold !== null && value > rule.threshold;
      break;
    case "confidence_below":
      if (!signal) return null;
      value = signal.confidence;
      matches = rule.threshold !== null && value < rule.threshold;
      break;
    case "signal_bullish":
      if (!signal) return null;
      value = signal.score;
      matches = signal.signal === "bullish";
      break;
    case "signal_bearish":
      if (!signal) return null;
      value = signal.score;
      matches = signal.signal === "bearish";
      break;
  }
  // At most one trigger per rule/provider trading day; repeated evaluations/edits cannot flood history.
  return matches
    ? {
        trigger_value: value,
        dataset_version: "twelve:" + quote.timestamp.slice(0, 10),
        message: `${quote.symbol}: ${rule.condition_type.replaceAll("_", " ")}${rule.threshold === null ? "" : " " + rule.threshold} matched at ${quote.price.toFixed(2)} ${quote.currency}. Quote as of ${quote.timestamp}.`,
      }
    : null;
}
