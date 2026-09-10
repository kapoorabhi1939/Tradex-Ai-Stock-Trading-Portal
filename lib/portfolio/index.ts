import { getEquity } from "../demo-market";
export type Holding = {
  id: string;
  ticker: string;
  shares: number;
  average_cost: number;
};
export function analyzePortfolio(holdings: Holding[]) {
  const positions = holdings.map((h) => {
    const equity = getEquity(h.ticker);
    if (
      !equity ||
      !Number.isFinite(h.shares) ||
      h.shares <= 0 ||
      !Number.isFinite(h.average_cost) ||
      h.average_cost < 0
    )
      throw new Error("Invalid portfolio holding");
    return {
      ...h,
      equity,
      value: h.shares * equity.price,
      cost: h.shares * h.average_cost,
    };
  });
  const total = positions.reduce((sum, p) => sum + p.value, 0);
  const cost = positions.reduce((sum, p) => sum + p.cost, 0);
  const weighted = positions.map((p) => ({
    ...p,
    weight: total ? (p.value / total) * 100 : 0,
    gain: p.value - p.cost,
  }));
  const sectors = Object.entries(
    weighted.reduce<Record<string, number>>((acc, p) => {
      acc[p.equity.sector] = (acc[p.equity.sector] ?? 0) + p.value;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value, weight: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
  const largestPosition = Math.max(0, ...weighted.map((p) => p.weight));
  const largestSector = sectors[0]?.weight ?? 0;
  const concentration =
    weighted.reduce((sum, p) => sum + (p.weight / 100) ** 2, 0) * 100;
  const sectorConcentration =
    sectors.reduce((sum, s) => sum + (s.weight / 100) ** 2, 0) * 100;
  const volatility = weighted.reduce(
    (sum, p) => sum + (p.equity.volatility * p.weight) / 100,
    0,
  );
  const risk = total
    ? Math.round(
        Math.min(
          100,
          concentration * 0.35 +
            sectorConcentration * 0.35 +
            Math.min(100, volatility * 2) * 0.3,
        ),
      )
    : 0;
  const flags: string[] = [];
  if (largestPosition > 35)
    flags.push(
      "Single-name concentration exceeds 35%. Review the largest position's influence on your portfolio.",
    );
  if (largestSector > 50)
    flags.push(
      `${sectors[0].name} represents ${largestSector.toFixed(0)}% of value. Consider broader sector diversification.`,
    );
  if ((sectors.find((s) => s.name === "Technology")?.weight ?? 0) > 50)
    flags.push(
      "Correlated technology exposure may amplify drawdowns. Review overlapping business drivers.",
    );
  if (volatility > 25)
    flags.push(
      "Elevated historical volatility. Review whether these price swings fit your risk tolerance.",
    );
  return {
    positions: weighted,
    total,
    cost,
    gain: total - cost,
    gainPercent: cost ? ((total - cost) / cost) * 100 : 0,
    sectors,
    largestPosition,
    largestSector,
    concentration: Math.round(concentration),
    diversification: total
      ? Math.round(100 - (concentration + sectorConcentration) / 2)
      : 0,
    volatility,
    risk,
    flags,
  };
}
