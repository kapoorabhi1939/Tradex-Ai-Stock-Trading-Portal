export const conditions = {
  price_above: "Price above",
  price_below: "Price below",
  confidence_above: "Signal score above",
  confidence_below: "Signal score below",
  signal_bullish: "Signal is bullish",
  signal_bearish: "Signal is bearish",
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
