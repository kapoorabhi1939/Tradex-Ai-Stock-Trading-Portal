import { DATASET_DATE, type Equity } from "../demo-market";
export type SignalDirection = "bullish" | "neutral" | "bearish";
export type Signal = {
  ticker: string;
  signal: SignalDirection;
  confidence: number;
  score: number;
  horizon: string;
  drivers: { label: string; value: number; weight: number }[];
  explanation: string;
  generatedAt: string;
};
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));
export function calculateSignal(e: Equity): Signal {
  const prices = e.bars.map((b) => b.close);
  const current = prices.at(-1)!;
  const mean = (n: number) => prices.slice(-n).reduce((a, b) => a + b, 0) / n;
  const momentum5 = (current / prices.at(-6)! - 1) * 100;
  const momentum20 = (current / prices.at(-21)! - 1) * 100;
  const ma20 = (current / mean(20) - 1) * 100;
  const trend = (mean(20) / mean(60) - 1) * 100;
  const drivers = [
    {
      label: `5-session momentum ${momentum5 >= 0 ? "+" : ""}${momentum5.toFixed(1)}%`,
      value: clamp(momentum5 / 5, -1, 1),
      weight: 0.25,
    },
    {
      label: `20-session momentum ${momentum20 >= 0 ? "+" : ""}${momentum20.toFixed(1)}%`,
      value: clamp(momentum20 / 12, -1, 1),
      weight: 0.25,
    },
    {
      label: `Price ${Math.abs(ma20).toFixed(1)}% ${ma20 >= 0 ? "above" : "below"} 20-session average`,
      value: clamp(ma20 / 6, -1, 1),
      weight: 0.2,
    },
    {
      label: `20-session average ${trend >= 0 ? "above" : "below"} 60-session average`,
      value: clamp(trend / 8, -1, 1),
      weight: 0.2,
    },
    {
      label: `${e.sentiment >= 0 ? "Positive" : "Negative"} demonstration sentiment (${e.sentiment.toFixed(2)})`,
      value: e.sentiment,
      weight: 0.1,
    },
  ];
  const score = drivers.reduce((sum, d) => sum + d.value * d.weight, 0);
  const signal: SignalDirection =
    score > 0.18 ? "bullish" : score < -0.18 ? "bearish" : "neutral";
  const agreement = drivers.reduce(
    (sum, d) => sum + (Math.sign(d.value) === Math.sign(score) ? d.weight : 0),
    0,
  );
  const strength =
    signal === "neutral" ? 1 - Math.abs(score) / 0.18 : Math.abs(score);
  const confidence = Math.round(
    clamp(45 + strength * 30 + agreement * 20 - e.volatility * 0.25, 0, 100),
  );
  return {
    ticker: e.ticker,
    signal,
    confidence,
    score,
    horizon: "5–20 trading sessions",
    drivers,
    explanation: `${drivers[0].label}; ${drivers[2].label.toLowerCase()}. The weighted factors give a ${signal} demonstration indication. ${e.volatility.toFixed(1)}% annualized historical volatility moderates the confidence score.`,
    generatedAt: DATASET_DATE,
  };
}
