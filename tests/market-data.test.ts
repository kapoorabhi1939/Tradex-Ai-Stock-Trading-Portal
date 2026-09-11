import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeQuote,
  normalizeHistory,
  normalizeSearch,
  symbolKey,
  numeric,
} from "../lib/market-data/normalizers";
import { MarketDataError, providerError } from "../lib/market-data/errors";
import { MarketCache, CACHE_POLICY } from "../lib/market-data/cache";
import {
  technicalSignal,
  valuePortfolio,
  evaluateMarketRule,
} from "../lib/market-data/analytics";
import type {
  MarketCandle,
  MarketResult,
  MarketQuote,
} from "../lib/market-data/types";
const raw = {
  symbol: "AAPL",
  name: "Apple Inc.",
  exchange: "NASDAQ",
  currency: "USD",
  type: "Common Stock",
  close: "110",
  previous_close: "100",
  open: "102",
  high: "111",
  low: "101",
  volume: "1000",
  timestamp: 1789047000,
  is_market_open: true,
};
const q = normalizeQuote(raw);
const result = (data: MarketQuote | null): MarketResult<MarketQuote> => ({
  data,
  stale: false,
  fetchedAt: "2026-09-10T13:30:00Z",
  error: null,
});
const bars: MarketCandle[] = Array.from({ length: 80 }, (_, i) => ({
  date: new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10),
  open: 100 + i,
  high: 101 + i,
  low: 99 + i,
  close: 100 + i,
  volume: 100,
}));
test("quote normalizes numeric strings, metadata, timestamps and calculated changes", () => {
  assert.equal(q.price, 110);
  assert.equal(q.change, 10);
  assert.ok(Math.abs(q.percentChange! - 10) < 1e-10);
  assert.equal(q.type, "Equity");
  assert.equal(q.marketOpen, true);
  assert.equal(normalizeQuote({ ...raw, volume: null }).volume, null);
});
test("malformed quote is rejected without fabricated price or timestamp", () => {
  for (const patch of [
    { close: "NaN" },
    { close: "-1" },
    { timestamp: null },
    { symbol: "../../bad" },
  ])
    assert.throws(() => normalizeQuote({ ...raw, ...patch }), MarketDataError);
  assert.equal(numeric(""), null);
  assert.equal(numeric(null), null);
});
test("provider error categories safely handle quota, missing symbol and failures", () => {
  for (const [code, expected] of [
    [429, "rate_limit"],
    [404, "not_found"],
    [500, "unavailable"],
  ] as const) {
    assert.throws(
      () =>
        providerError({
          status: "error",
          code,
          message: "private-provider-detail",
        }),
      (e: unknown) =>
        e instanceof MarketDataError &&
        e.code === expected &&
        !e.message.includes("private-provider-detail"),
    );
  }
});
test("history parses OHLC, orders chronologically and removes duplicate dates", () => {
  const a = {
      datetime: "2026-09-09",
      open: "10",
      high: "12",
      low: "9",
      close: "11",
    },
    b = { ...a, datetime: "2026-09-10" };
  const v = normalizeHistory({ values: [b, a, b] });
  assert.equal(v.length, 2);
  assert.equal(v[0].date, a.datetime);
  assert.equal(v[1].close, 11);
  assert.throws(() => normalizeHistory({ values: [{ ...a, high: "8" }] }));
  assert.throws(() => normalizeHistory({ values: [] }));
});
test("search handles provider instruments outside saved equities and asset classes", () => {
  const r = normalizeSearch({
    data: [
      {
        symbol: "EUR/USD",
        instrument_name: "Euro / US Dollar",
        instrument_type: "Physical Currency",
        currency: "USD",
      },
      {
        symbol: "SPY",
        instrument_name: "SPDR S&P 500 ETF",
        instrument_type: "ETF",
      },
    ],
  });
  assert.equal(r[0].symbol, "EUR/USD");
  assert.equal(r[0].type, "Forex");
  assert.equal(r[1].type, "ETF");
  assert.deepEqual(normalizeSearch({ data: [] }), []);
  assert.throws(() => normalizeSearch({ data: "bad" }));
});
test("safe symbol keys normalize case and preserve encoded multi-asset deep links", () => {
  assert.equal(symbolKey(" aapl:NASDAQ "), "AAPL:NASDAQ");
  assert.equal(
    decodeURIComponent(encodeURIComponent(symbolKey("eur/usd"))),
    "EUR/USD",
  );
  for (const s of ["", "AAPL,MSFT", "../secret?", "AAPL&apikey=x"])
    assert.throws(() => symbolKey(s));
});
test("cache deduplicates simultaneous loaders and serves TTL hits", async () => {
  let now = 1000,
    calls = 0;
  const cache = new MarketCache(() => now),
    load = async () => {
      calls++;
      await Promise.resolve();
      return q;
    };
  await Promise.all([cache.get("AAPL", 60, load), cache.get("AAPL", 60, load)]);
  assert.equal(calls, 1);
  now += 30;
  assert.equal((await cache.get("AAPL", 60, load)).stale, false);
  assert.equal(calls, 1);
  now += 40;
  await cache.get("AAPL", 60, load);
  assert.equal(calls, 2);
});
test("cache serves bounded stale real data and suppresses repeated failed calls", async () => {
  let now = 1000,
    calls = 0;
  const cache = new MarketCache(() => now);
  await cache.get("AAPL", 60, async () => q);
  now += 70;
  const fail = async () => {
    calls++;
    throw new MarketDataError("rate_limit");
  };
  const stale = await cache.get<MarketQuote>("AAPL", 60, fail);
  assert.equal(stale.data?.price, 110);
  assert.equal(stale.stale, true);
  await cache.get<MarketQuote>("AAPL", 60, fail);
  assert.equal(calls, 1);
  now += 86_400_001;
  assert.equal((await cache.get<MarketQuote>("AAPL", 60, fail)).data, null);
  assert.equal((await cache.get("unknown", 60, fail)).data, null);
});
test("real-format candle signal is deterministic, bounded and sentiment-free", () => {
  const s = technicalSignal("AAPL", bars)!;
  assert.equal(s.signal, "bullish");
  assert.equal(
    s.drivers.reduce((sum, d) => sum + d.weight, 0),
    1,
  );
  assert.ok(s.confidence >= 0 && s.confidence <= 100);
  assert.deepEqual(s, technicalSignal("AAPL", bars));
  assert.ok(!s.explanation.includes("sentiment"));
  assert.equal(technicalSignal("AAPL", bars.slice(0, 50)), null);
  const down = bars.map((b, i) => ({ ...b, close: 200 - i }));
  assert.equal(technicalSignal("AAPL", down)!.signal, "bearish");
  assert.equal(
    technicalSignal(
      "AAPL",
      bars.map((b) => ({ ...b, close: 100 })),
    )!.signal,
    "neutral",
  );
});
test("live valuation retains costs and distinguishes missing positions from zero", () => {
  const holdings = [
    { id: "1", ticker: "AAPL", shares: 2, average_cost: 100 },
    { id: "2", ticker: "MSFT", shares: 3, average_cost: 50 },
  ];
  const partial = valuePortfolio(holdings, {
    AAPL: result(q),
    MSFT: result(null),
  });
  assert.equal(partial.cost, 350);
  assert.equal(partial.knownValue, 220);
  assert.equal(partial.total, null);
  assert.equal(partial.gain, null);
  assert.equal(partial.positions[1].value, null);
  const complete = valuePortfolio(holdings, {
    AAPL: result(q),
    MSFT: result({ ...q, symbol: "MSFT", price: 60 }),
  });
  assert.equal(complete.total, 400);
  assert.equal(complete.gain, 50);
  assert.equal(
    valuePortfolio(holdings, { AAPL: result({ ...q, currency: "EUR" }) })
      .partial,
    true,
  );
});
test("market alert evaluation uses actual quote and stable per-day deduplication keys", () => {
  const r = {
    id: "1",
    ticker: "AAPL",
    condition_type: "price_above" as const,
    threshold: 100,
    enabled: true,
  };
  const match = evaluateMarketRule(r, q, null)!;
  assert.equal(match.trigger_value, 110);
  assert.equal(
    match.dataset_version,
    evaluateMarketRule(
      r,
      { ...q, timestamp: q.timestamp.slice(0, 10) + "T20:00:00.000Z" },
      null,
    )!.dataset_version,
  );
  assert.equal(evaluateMarketRule({ ...r, threshold: 110 }, q, null), null);
  assert.equal(evaluateMarketRule({ ...r, enabled: false }, q, null), null);
  assert.equal(
    evaluateMarketRule({ ...r, condition_type: "confidence_above" }, q, null),
    null,
  );
});

test("HTTP transport keeps credentials in headers, never URLs", async () => {
  const { fetchMarketJson } = await import("../lib/market-data/transport");
  let observed = false;
  await fetchMarketJson(
    "quote",
    { symbol: "AAPL" },
    "unit-test-token",
    async (url, options) => {
      assert.ok(!String(url).includes("unit-test-token"));
      assert.equal(
        (options?.headers as Record<string, string>).Authorization,
        "apikey unit-test-token",
      );
      observed = true;
      return new Response(JSON.stringify(raw));
    },
  );
  assert.equal(observed, true);
});
test("HTTP transport handles quota, provider errors, malformed JSON and network failure", async () => {
  const { fetchMarketJson } = await import("../lib/market-data/transport");
  for (const [response, code] of [
    [new Response("", { status: 429 }), "rate_limit"],
    [
      new Response(JSON.stringify({ status: "error", code: 429 })),
      "rate_limit",
    ],
    [new Response("not-json"), "invalid_response"],
  ] as const) {
    await assert.rejects(
      fetchMarketJson(
        "quote",
        { symbol: "AAPL" },
        "unit-test-token",
        async () => response,
      ),
      (e: unknown) => e instanceof MarketDataError && e.code === code,
    );
  }
  await assert.rejects(
    fetchMarketJson("quote", {}, "unit-test-token", async () => {
      throw Error("sensitive network detail");
    }),
    (e: unknown) =>
      e instanceof MarketDataError && !e.message.includes("sensitive"),
  );
  await assert.rejects(
    fetchMarketJson("quote", {}, ""),
    (e: unknown) => e instanceof MarketDataError && e.code === "configuration",
  );
});

test("live signal and score rule types evaluate deterministically", () => {
  const signal = technicalSignal("AAPL", bars)!;
  const rule = {
    id: "1",
    ticker: "AAPL",
    condition_type: "confidence_above" as const,
    threshold: signal.confidence - 1,
    enabled: true,
  };
  assert.ok(evaluateMarketRule(rule, q, signal));
  assert.equal(
    evaluateMarketRule({ ...rule, threshold: signal.confidence }, q, signal),
    null,
  );
  assert.ok(
    evaluateMarketRule(
      {
        ...rule,
        condition_type: "confidence_below",
        threshold: signal.confidence + 1,
      },
      q,
      signal,
    ),
  );
  assert.ok(
    evaluateMarketRule(
      { ...rule, condition_type: "signal_bullish", threshold: null },
      q,
      signal,
    ),
  );
  assert.equal(
    evaluateMarketRule(
      { ...rule, condition_type: "signal_bearish", threshold: null },
      q,
      signal,
    ),
    null,
  );
});
test("forex precision and absent currency never fabricate a dollar price", async () => {
  const { marketMoney } = await import("../lib/format");
  assert.equal(marketMoney(1.16482, "", 5), "1.16482");
  assert.ok(marketMoney(1.16482, "USD", 5).includes("1.16482"));
  assert.equal(
    normalizeQuote({ ...raw, currency: undefined, currency_quote: "EUR" })
      .currency,
    "EUR",
  );
  assert.equal(numeric(true), null);
});

test("cache bounds disk seeds and negative entries", async () => {
  const cache = new MarketCache(() => 1_000);
  for (let i = 0; i <= CACHE_POLICY.maxEntries; i++)
    cache.seed("seed:" + i, { data: i, time: 1_000 });
  assert.equal(cache.peek("seed:0"), undefined);
  assert.equal(cache.peek<number>("seed:500")?.data, 500);
  const fail = async () => {
    throw new MarketDataError("unavailable");
  };
  for (let i = 0; i <= CACHE_POLICY.maxEntries; i++)
    await cache.get("fail:" + i, 100, fail);
  let retried = false;
  await cache.get("fail:0", 100, async () => {
    retried = true;
    return 1;
  });
  assert.equal(retried, true);
});

test("percentage formatting preserves tiny nonzero market moves", async () => {
  const { percent } = await import("../lib/format");
  assert.equal(percent(-0.00258), "-0.00258%");
  assert.equal(percent(3.56), "+3.56%");
});
