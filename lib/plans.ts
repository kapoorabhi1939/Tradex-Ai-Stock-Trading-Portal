export type PlanName = "Free" | "Plus" | "Pro";

export const plans = [
  {
    name: "Free" as const,
    price: "$0",
    period: "/ month",
    audience: "For investors building a clearer market routine.",
    features: [
      "Live market quotes",
      "Stock and ETF research",
      "Watchlist and portfolio tracking",
      "Tradex Signal",
      "Standard chart ranges",
    ],
  },
  {
    name: "Plus" as const,
    price: "$9.99",
    period: "/ month",
    audience: "For active investors who want broader context.",
    features: [
      "Everything in Free",
      "Expanded U.S. market research",
      "Expanded signal breakdowns",
      "Advanced alerts",
      "Tradex Insights",
    ],
    recommended: true,
  },
  {
    name: "Pro" as const,
    price: "$19.99",
    period: "/ month",
    audience: "For power users who need deeper intelligence.",
    features: [
      "Everything in Plus",
      "Premium Tradex Insights",
      "Advanced portfolio analytics",
      "Priority market intelligence",
      "Priority access to new tools",
    ],
  },
] as const;
