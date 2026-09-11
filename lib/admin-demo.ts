export const adminSummary = {
  totalUsers: 12_482,
  activeUsers: 8_914,
  paidSubscribers: 2_146,
  freeUsers: 10_336,
  plusSubscribers: 1_584,
  proSubscribers: 562,
  monthlyRevenue: 31_824,
  newUsers30Days: 1_284,
  publishedInsights: 48,
  activeAlerts: 18_392,
} as const;

export const adminUsers = [
  {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    plan: "Plus",
    joined: "Sep 8, 2026",
    status: "Active",
  },
  {
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    plan: "Free",
    joined: "Sep 7, 2026",
    status: "Active",
  },
  {
    name: "Taylor Brooks",
    email: "taylor.brooks@example.com",
    plan: "Pro",
    joined: "Sep 5, 2026",
    status: "Active",
  },
  {
    name: "Casey Rivera",
    email: "casey.rivera@example.com",
    plan: "Plus",
    joined: "Sep 2, 2026",
    status: "Active",
  },
  {
    name: "Riley Chen",
    email: "riley.chen@example.com",
    plan: "Free",
    joined: "Aug 29, 2026",
    status: "Active",
  },
  {
    name: "Morgan Patel",
    email: "morgan.patel@example.com",
    plan: "Pro",
    joined: "Aug 25, 2026",
    status: "Active",
  },
  {
    name: "Avery Thompson",
    email: "avery.thompson@example.com",
    plan: "Free",
    joined: "Aug 22, 2026",
    status: "Invited",
  },
  {
    name: "Cameron Davis",
    email: "cameron.davis@example.com",
    plan: "Plus",
    joined: "Aug 18, 2026",
    status: "Active",
  },
  {
    name: "Quinn Parker",
    email: "quinn.parker@example.com",
    plan: "Free",
    joined: "Aug 14, 2026",
    status: "Paused",
  },
  {
    name: "Sydney Martin",
    email: "sydney.martin@example.com",
    plan: "Plus",
    joined: "Aug 10, 2026",
    status: "Active",
  },
] as const;

export const subscriptionActivity = [
  {
    account: "Alex Morgan",
    event: "Upgrade",
    plan: "Plus",
    date: "Sep 10, 2026",
  },
  {
    account: "Taylor Brooks",
    event: "New subscription",
    plan: "Pro",
    date: "Sep 9, 2026",
  },
  {
    account: "Casey Rivera",
    event: "Upgrade",
    plan: "Plus",
    date: "Sep 8, 2026",
  },
  {
    account: "Quinn Parker",
    event: "Cancellation",
    plan: "Free",
    date: "Sep 7, 2026",
  },
  {
    account: "Morgan Patel",
    event: "Upgrade",
    plan: "Pro",
    date: "Sep 6, 2026",
  },
  {
    account: "Sydney Martin",
    event: "Downgrade",
    plan: "Plus",
    date: "Sep 4, 2026",
  },
] as const;

export const adminInsights = [
  {
    symbol: "AAPL",
    headline: "Momentum remains constructive near recent highs",
    audience: "All users",
    status: "Published",
    date: "Sep 10",
  },
  {
    symbol: "NVDA",
    headline: "Volatility remains elevated after a strong move",
    audience: "Plus",
    status: "Published",
    date: "Sep 9",
  },
  {
    symbol: "SPY",
    headline: "Broad-market momentum remains positive",
    audience: "All users",
    status: "Published",
    date: "Sep 8",
  },
  {
    symbol: "MSFT",
    headline: "Price action consolidates above the 50-day average",
    audience: "Pro",
    status: "Draft",
    date: "Sep 7",
  },
] as const;

export const userGrowth = [
  { label: "Apr", value: 8_946 },
  { label: "May", value: 9_515 },
  { label: "Jun", value: 10_128 },
  { label: "Jul", value: 10_874 },
  { label: "Aug", value: 11_642 },
  { label: "Sep", value: 12_482 },
] as const;

export const revenueTrend = [
  { label: "Apr", value: 22_480 },
  { label: "May", value: 24_190 },
  { label: "Jun", value: 25_860 },
  { label: "Jul", value: 27_540 },
  { label: "Aug", value: 29_760 },
  { label: "Sep", value: 31_824 },
] as const;

export function adminTotalsAreConsistent() {
  return (
    adminSummary.freeUsers +
      adminSummary.plusSubscribers +
      adminSummary.proSubscribers ===
      adminSummary.totalUsers &&
    adminSummary.plusSubscribers + adminSummary.proSubscribers ===
      adminSummary.paidSubscribers
  );
}
