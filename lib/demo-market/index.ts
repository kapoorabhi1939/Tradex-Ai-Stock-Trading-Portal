export const DATASET_VERSION = "tradex-demo-2026-09-09-v1";
export const DATASET_DATE = "2026-09-09T20:00:00.000Z";
export type PriceBar = { date: string; close: number };
export type Equity = {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  marketCap: number;
  volume: number;
  sentiment: number;
  volatility: number;
  description: string;
  bars: PriceBar[];
  related: string[];
};
// Entirely fictional market snapshot. These values are not current market quotes.
const seeds = [
  [
    "AAPL",
    "Apple Inc.",
    "Technology",
    228.64,
    1.24,
    3.45e12,
    48200000,
    0.42,
    0.0012,
    0.016,
    "Consumer devices, software, and a global services ecosystem.",
  ],
  [
    "NVDA",
    "NVIDIA Corporation",
    "Technology",
    142.87,
    2.36,
    3.5e12,
    189000000,
    0.73,
    0.0034,
    0.029,
    "Accelerated computing, graphics, and AI infrastructure.",
  ],
  [
    "MSFT",
    "Microsoft Corporation",
    "Technology",
    438.52,
    0.68,
    3.26e12,
    22400000,
    0.51,
    0.0018,
    0.013,
    "Enterprise software, cloud infrastructure, and productivity platforms.",
  ],
  [
    "AMZN",
    "Amazon.com Inc.",
    "Consumer Discretionary",
    214.38,
    -0.42,
    2.25e12,
    34100000,
    0.24,
    0.0004,
    0.019,
    "Global commerce, logistics, and cloud computing services.",
  ],
  [
    "TSLA",
    "Tesla Inc.",
    "Consumer Discretionary",
    287.16,
    -2.18,
    915e9,
    87900000,
    -0.48,
    -0.0025,
    0.037,
    "Electric vehicles, energy storage, and charging infrastructure.",
  ],
  [
    "META",
    "Meta Platforms Inc.",
    "Communication Services",
    612.43,
    1.53,
    1.55e12,
    18700000,
    0.61,
    0.0022,
    0.021,
    "Social platforms, digital advertising, and extended reality.",
  ],
  [
    "GOOGL",
    "Alphabet Inc.",
    "Communication Services",
    181.26,
    -0.31,
    2.21e12,
    25900000,
    -0.12,
    -0.0007,
    0.017,
    "Search, digital advertising, video, and cloud services.",
  ],
  [
    "JPM",
    "JPMorgan Chase & Co.",
    "Financials",
    241.82,
    0.47,
    678e9,
    9300000,
    0.32,
    0.001,
    0.012,
    "Diversified financial services, banking, and asset management.",
  ],
  [
    "JNJ",
    "Johnson & Johnson",
    "Healthcare",
    163.54,
    0.23,
    394e9,
    7200000,
    0.1,
    0.0003,
    0.009,
    "Innovative medicine and medical technology.",
  ],
  [
    "XOM",
    "Exxon Mobil Corporation",
    "Energy",
    116.78,
    -0.62,
    512e9,
    14600000,
    -0.21,
    -0.0008,
    0.015,
    "Integrated energy production, refining, and low-carbon initiatives.",
  ],
  [
    "PG",
    "Procter & Gamble Co.",
    "Consumer Staples",
    174.23,
    0.32,
    410e9,
    5800000,
    0.2,
    0.0005,
    0.008,
    "Everyday household, personal care, and health products.",
  ],
  [
    "CAT",
    "Caterpillar Inc.",
    "Industrials",
    358.91,
    0.84,
    175e9,
    2600000,
    0.36,
    0.0009,
    0.016,
    "Construction equipment, mining machinery, and power systems.",
  ],
] as const;
function history(
  ticker: string,
  price: number,
  change: number,
  drift: number,
  noise: number,
): PriceBar[] {
  let seed = [...ticker].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 27);
  const values = [100];
  for (let i = 1; i < 180; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    values.push(
      values[i - 1] * (1 + drift + (seed / 4294967296 - 0.5) * noise * 2),
    );
  }
  const dates: string[] = [];
  const date = new Date(DATASET_DATE);
  while (dates.length < 180) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6)
      dates.unshift(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() - 1);
  }
  const bars = values.map((value, i) => ({
    date: dates[i],
    close: +((value / values.at(-1)!) * price).toFixed(2),
  }));
  bars[bars.length - 2].close = +(price / (1 + change / 100)).toFixed(2);
  return bars;
}
export function annualizedVolatility(bars: PriceBar[]): number {
  const returns = bars.slice(1).map((bar, i) => bar.close / bars[i].close - 1);
  if (!returns.length) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  return (
    Math.sqrt(
      returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length,
    ) *
    Math.sqrt(252) *
    100
  );
}
export const equities: Equity[] = seeds.map(
  ([
    ticker,
    name,
    sector,
    price,
    change,
    marketCap,
    volume,
    sentiment,
    drift,
    noise,
    description,
  ]) => {
    const bars = history(ticker, price, change, drift, noise);
    return {
      ticker,
      name,
      sector,
      price,
      change: +(100 * (price / bars.at(-2)!.close - 1)).toFixed(2),
      marketCap,
      volume,
      sentiment,
      volatility: annualizedVolatility(bars.slice(-61)),
      description,
      bars,
      related: seeds
        .filter((s) => s[0] !== ticker && s[2] === sector)
        .map<string>((s) => s[0])
        .concat(["JPM", "MSFT", "AMZN"].filter((t) => t !== ticker))
        .filter((t, i, a) => a.indexOf(t) === i)
        .slice(0, 3),
    };
  },
);
export function getEquity(ticker: string): Equity | undefined {
  return equities.find((e) => e.ticker === ticker.toUpperCase());
}
export function demoHeadlines(e: Equity) {
  return [
    {
      title: `${e.name}: investors weigh demand trends across ${e.sector.toLowerCase()}`,
      source: "Synthetic market brief",
      time: "Dataset scenario 01",
    },
    {
      title: `${e.ticker} outlook: margins and capital spending remain in focus`,
      source: "Synthetic company brief",
      time: "Dataset scenario 02",
    },
    {
      title: "Sector perspective: what could shape the next earnings cycle",
      source: "Synthetic sector brief",
      time: "Dataset scenario 03",
    },
  ];
}
