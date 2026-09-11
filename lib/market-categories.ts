export const marketCategories = [
  {
    title: "U.S. Stocks",
    description: "NASDAQ and NYSE listed companies",
    href: "/research/AAPL",
    action: "Explore AAPL",
  },
  {
    title: "ETFs",
    description: "U.S.-listed funds and broad-market exposure",
    href: "/research/SPY%3ANYSE",
    action: "Explore SPY",
  },
  {
    title: "Forex",
    description: "Major currency pairs",
    href: "/research/EUR%2FUSD",
    action: "Explore EUR/USD",
  },
  {
    title: "Crypto",
    description: "Provider-supported digital assets",
    href: "/research",
    action: "Search crypto",
  },
  {
    title: "Commodities",
    description: "Provider-supported spot instruments",
    href: "/research",
    action: "Search commodities",
  },
  {
    title: "Futures",
    description: "Futures data access is coming soon.",
    action: "No contract data displayed",
    comingSoon: true,
  },
] as const;
