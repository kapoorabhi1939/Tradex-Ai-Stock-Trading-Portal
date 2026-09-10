import test from "node:test";
import assert from "node:assert/strict";
import {
  equities,
  getEquity,
  annualizedVolatility,
  DATASET_DATE,
} from "../lib/demo-market";
import { calculateSignal } from "../lib/signals";
import { analyzePortfolio, type Holding } from "../lib/portfolio";
import { evaluateRule, type AlertRule } from "../lib/alerts";
import {
  alertFields,
  numberField,
  tickerField,
  safeDestination,
} from "../lib/validation";
const holding = (ticker: string, shares = 10, average_cost = 100): Holding => ({
  id: ticker,
  ticker,
  shares,
  average_cost,
});
const rule = (
  condition_type: AlertRule["condition_type"],
  threshold: number | null,
): AlertRule => ({
  id: "rule",
  ticker: "AAPL",
  condition_type,
  threshold,
  enabled: true,
});
function form(values: Record<string, string>) {
  const f = new FormData();
  Object.entries(values).forEach(([k, v]) => f.set(k, v));
  return f;
}

test("every quote matches its last bar, daily change, and fixed snapshot", () => {
  assert.equal(equities.length, 12);
  for (const e of equities) {
    assert.equal(e.bars.length, 180);
    assert.equal(e.bars.at(-1)!.close, e.price);
    assert.equal(e.bars.at(-1)!.date, DATASET_DATE.slice(0, 10));
    assert.equal(
      e.change,
      +(100 * (e.price / e.bars.at(-2)!.close - 1)).toFixed(2),
    );
    assert.ok(
      e.bars.every(
        (bar, i) => bar.close > 0 && (i === 0 || bar.date > e.bars[i - 1].date),
      ),
    );
    assert.ok(e.related.every((t) => t !== e.ticker && getEquity(t)));
    assert.ok(Number.isFinite(e.volatility));
  }
});
test("ticker lookup handles case and rejects unsupported symbols", () => {
  assert.equal(getEquity("aapl")?.ticker, "AAPL");
  assert.equal(getEquity("FAKE"), undefined);
});
test("signal output is deterministic, bounded, and derived from weighted drivers", () => {
  for (const e of equities) {
    const signal = calculateSignal(e);
    assert.deepEqual(signal, calculateSignal(structuredClone(e)));
    assert.ok(signal.confidence >= 0 && signal.confidence <= 100);
    assert.ok(
      Math.abs(signal.drivers.reduce((s, d) => s + d.weight, 0) - 1) < 1e-12,
    );
    assert.equal(
      signal.score,
      signal.drivers.reduce((s, d) => s + d.value * d.weight, 0),
    );
    assert.ok(signal.explanation.includes(signal.drivers[0].label));
  }
});
test("rising and falling histories change model direction", () => {
  const e = getEquity("AAPL")!;
  const trending = (growth: number) => ({
    ...e,
    sentiment: growth > 0 ? 0.5 : -0.5,
    bars: e.bars.map((b, i) => ({ ...b, close: 100 * Math.exp(i * growth) })),
  });
  assert.equal(calculateSignal(trending(0.006)).signal, "bullish");
  assert.equal(calculateSignal(trending(-0.006)).signal, "bearish");
});
test("higher volatility moderates signal confidence", () => {
  const e = getEquity("NVDA")!;
  assert.ok(
    calculateSignal({ ...e, volatility: 80 }).confidence <
      calculateSignal({ ...e, volatility: 5 }).confidence,
  );
});
test("flat prices have zero realized volatility", () => {
  assert.equal(
    annualizedVolatility([
      { date: "1", close: 100 },
      { date: "2", close: 100 },
    ]),
    0,
  );
});
test("portfolio values, cost, weights, and gains come from saved holdings", () => {
  const report = analyzePortfolio([
    holding("AAPL", 2, 200),
    holding("JPM", 3, 210),
  ]);
  assert.equal(
    report.total,
    2 * getEquity("AAPL")!.price + 3 * getEquity("JPM")!.price,
  );
  assert.equal(report.cost, 1030);
  assert.equal(report.gain, report.total - 1030);
  assert.ok(
    Math.abs(report.positions.reduce((s, p) => s + p.weight, 0) - 100) < 1e-8,
  );
  assert.ok(
    Math.abs(report.sectors.reduce((s, p) => s + p.weight, 0) - 100) < 1e-8,
  );
});
test("technology concentration flags risk and diversification improves it", () => {
  const concentrated = analyzePortfolio(
    ["AAPL", "MSFT", "NVDA"].map((t) => holding(t, 1000 / getEquity(t)!.price)),
  );
  const diversified = analyzePortfolio(
    ["AAPL", "JPM", "JNJ", "XOM", "PG", "CAT"].map((t) =>
      holding(t, 1000 / getEquity(t)!.price),
    ),
  );
  assert.ok(concentrated.flags.some((f) => f.includes("technology")));
  assert.ok(diversified.diversification > concentrated.diversification);
  assert.ok(diversified.risk < concentrated.risk);
});
test("holding edits and removals change totals", () => {
  const one = analyzePortfolio([holding("AAPL", 1)]);
  assert.equal(analyzePortfolio([holding("AAPL", 2)]).total, one.total * 2);
  assert.equal(analyzePortfolio([]).total, 0);
});
test("empty and zero-cost portfolios return finite metrics", () => {
  for (const report of [
    analyzePortfolio([]),
    analyzePortfolio([holding("AAPL", 1, 0)]),
  ])
    for (const key of [
      "total",
      "gainPercent",
      "risk",
      "diversification",
      "volatility",
    ] as const)
      assert.ok(Number.isFinite(report[key]));
});
test("portfolio rejects malformed quantities and unknown securities", () => {
  for (const h of [
    holding("BAD"),
    holding("AAPL", -1),
    holding("AAPL", NaN),
    holding("AAPL", 1, -1),
  ])
    assert.throws(() => analyzePortfolio([h]));
});
test("price alert comparisons are strict and use the shared quote", () => {
  const price = getEquity("AAPL")!.price;
  assert.equal(evaluateRule(rule("price_above", price)), null);
  assert.equal(evaluateRule(rule("price_below", price)), null);
  assert.equal(
    evaluateRule(rule("price_above", price - 1))?.trigger_value,
    price,
  );
  assert.equal(
    evaluateRule(rule("price_below", price + 1))?.trigger_value,
    price,
  );
});
test("confidence alert comparisons use the shared signal", () => {
  const value = calculateSignal(getEquity("AAPL")!).confidence;
  assert.equal(evaluateRule(rule("confidence_above", value)), null);
  assert.equal(
    evaluateRule(rule("confidence_above", value - 1))?.trigger_value,
    value,
  );
  assert.equal(
    evaluateRule(rule("confidence_below", value + 1))?.trigger_value,
    value,
  );
});
test("signal rules match only their requested state; disabled rules never trigger", () => {
  for (const e of equities) {
    const signal = calculateSignal(e);
    assert.equal(
      Boolean(
        evaluateRule({ ...rule("signal_bullish", null), ticker: e.ticker }),
      ),
      signal.signal === "bullish",
    );
    assert.equal(
      Boolean(
        evaluateRule({ ...rule("signal_bearish", null), ticker: e.ticker }),
      ),
      signal.signal === "bearish",
    );
  }
  assert.equal(
    evaluateRule({ ...rule("price_above", 0), enabled: false }),
    null,
  );
});
test("input validation rejects unknown symbols, blank values, nonfinite and out-of-range numbers", () => {
  assert.throws(() => tickerField(form({ ticker: "BAD" })));
  for (const n of ["", "NaN", "Infinity", "-2", "101"])
    assert.throws(() => numberField(form({ n }), "n", 0, 100));
  assert.throws(() =>
    alertFields(
      form({
        ticker: "AAPL",
        condition_type: "confidence_above",
        threshold: "101",
      }),
    ),
  );
  assert.throws(() =>
    alertFields(
      form({ ticker: "AAPL", condition_type: "toString", threshold: "1" }),
    ),
  );
  assert.equal(
    alertFields(form({ ticker: "aapl", condition_type: "signal_bullish" }))
      .threshold,
    null,
  );
});
test("login redirect only accepts local application routes", () => {
  for (const url of [
    "https://evil.example",
    "//evil.example",
    "/dashboard\\evil",
    "/dashboard\r\n",
    "/login",
    "/dashboardevil",
  ])
    assert.equal(safeDestination(url), "/dashboard");
  assert.equal(safeDestination("/research/NVDA"), "/research/NVDA");
});
