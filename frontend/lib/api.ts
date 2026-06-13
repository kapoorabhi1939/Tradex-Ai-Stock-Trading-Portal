import type {
  AccountSummary,
  AlertRule,
  AuthResponse,
  ComplianceStatus,
  InstrumentMeta,
  MarketDepthSnapshot,
  MarketQuote,
  MarketStats,
  OrderEstimate,
  OrderRecord,
  OrderType,
  OrderTypesCatalog,
  PortfolioHolding,
  PortfolioRiskReport,
  PositionSnapshot,
  RiskSnapshot,
  SentimentResult,
  SignalResult,
  SymbolOverview,
  TradesTape,
  WatchlistItem
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const baseFreshness = {
  updated_at: "2026-06-08T14:30:00+00:00",
  stale_after_seconds: 60,
  is_stale: false,
  message: "Demo freshness metadata"
};

const mockOverview: SymbolOverview = {
  ticker: "NVDA",
  company_name: "NVIDIA Corporation",
  sector: "Technology",
  latest_price: 132.42,
  price_change: 2.14,
  price_change_percent: 1.64,
  description: "AI infrastructure leader showing strong acceleration in enterprise demand.",
  recent_bars: []
};

const mockQuote: MarketQuote = {
  ticker: "NVDA",
  mark_price: 132.42,
  bid: 132.37,
  ask: 132.47,
  timestamp: "2026-06-08T14:30:00+00:00",
  freshness: { ...baseFreshness, stale_after_seconds: 3, message: "If no updates arrive for 3 seconds, mark quote stale." }
};

const mockSignal: SignalResult = {
  ticker: "NVDA",
  signal: "bullish",
  confidence: 0.78,
  horizon: "1-3 trading sessions",
  features_used: ["short_moving_average", "five_bar_momentum", "realized_volatility"],
  generated_at: "2026-06-08T14:30:00+00:00",
  explanation: "Short-term momentum remains above the medium trend while sentiment stays constructive."
};

const mockSentiment: SentimentResult = {
  ticker: "NVDA",
  score: 0.41,
  label: "positive",
  headline_count: 3,
  summary: "Recent coverage leans constructive, especially around AI infrastructure demand and commercial strength.",
  generated_at: "2026-06-08T14:30:00+00:00"
};

const mockWatchlist: WatchlistItem[] = [
  { ticker: "AAPL", company_name: "Apple Inc.", latest_price: 199.85, signal: "bullish", confidence: 0.7 },
  { ticker: "MSFT", company_name: "Microsoft Corporation", latest_price: 429.11, signal: "bullish", confidence: 0.75 },
  { ticker: "NVDA", company_name: "NVIDIA Corporation", latest_price: 132.42, signal: "bullish", confidence: 0.78 }
];

const mockSummary: AccountSummary = {
  total_portfolio_value: 1250345.5,
  day_change_pct: 1.8,
  cash_available: 50000,
  ytd_return_pct: 12.4,
  freshness: { ...baseFreshness, message: "Disable trading CTA after 60 seconds without update." }
};

const mockRisk: RiskSnapshot = {
  margin_level_pct: 145.2,
  threshold_band: "warning",
  drawdown_used_pct: 36.5,
  leverage_tier: "retail",
  blocks_new_levered_orders: false,
  freshness: { ...baseFreshness, stale_after_seconds: 5, message: "If stale, display hard warning and prevent new levered orders." }
};

const mockCompliance: ComplianceStatus = {
  kyc_status: "verified",
  trading_restricted: false,
  restriction_scope: "none",
  banner_level: "info",
  banner_text: "Account verified. No active jurisdiction restrictions are blocking trades."
};

const mockPositions: PositionSnapshot[] = [
  {
    position_id: "pos-1",
    ticker: "AAPL",
    company_name: "Apple Inc.",
    quantity: 150,
    avg_entry_price: 127.345,
    mark_price: 199.6,
    unrealized_pl: 10838.25,
    leverage: 3,
    delisted: false,
    freshness: { ...baseFreshness, stale_after_seconds: 5, message: "Gray out P&L if quote stale for 5 seconds." },
    last_trade_time: "2026-06-08T14:30:00+00:00"
  },
  {
    position_id: "pos-2",
    ticker: "MSFT",
    company_name: "Microsoft Corporation",
    quantity: 48,
    avg_entry_price: 402.1,
    mark_price: 429.57,
    unrealized_pl: 1318.56,
    leverage: 3.5,
    delisted: false,
    freshness: { ...baseFreshness, stale_after_seconds: 5, message: "Gray out P&L if quote stale for 5 seconds." },
    last_trade_time: "2026-06-08T14:29:47+00:00"
  }
];

const mockPortfolioReport: PortfolioRiskReport = {
  holdings: [
    { ticker: "NVDA", shares: 8, average_cost: 118 },
    { ticker: "JPM", shares: 5, average_cost: 198 }
  ],
  sector_exposure: {
    Technology: 0.57,
    Financials: 0.43
  },
  concentration_score: 0.51,
  risk_flags: [
    {
      title: "Concentration risk",
      severity: "high",
      detail: "Technology still dominates overall value, so portfolio drawdowns could cluster."
    }
  ],
  rebalance_suggestions: [
    "Trim the largest position or add offsetting holdings to reduce concentration.",
    "Add exposure outside Technology to smooth sector-specific drawdowns."
  ],
  portfolio_value: 2059.86,
  generated_at: "2026-06-08T14:30:00+00:00"
};

const mockAlerts: AlertRule[] = [
  {
    alert_id: "alert-1",
    ticker: "NVDA",
    condition_type: "price_above",
    threshold: 130,
    delivery_channel: "email",
    enabled: true,
    created_at: "2026-06-08T14:30:00+00:00"
  }
];

const mockOrders: OrderRecord[] = [
  {
    order_id: "ord-1001",
    ticker: "NVDA",
    order_type: "LIMIT",
    status: "PARTIAL",
    filled_quantity: 25,
    total_quantity: 50,
    limit_price: 127.5,
    needs_reconcile: true,
    accessible_label: "NVDA LIMIT order is PARTIAL",
    freshness: { ...baseFreshness, stale_after_seconds: 10, message: "If fills pause, flag for manual verification." }
  },
  {
    order_id: "ord-1002",
    ticker: "AAPL",
    order_type: "MARKET",
    status: "FILLED",
    filled_quantity: 20,
    total_quantity: 20,
    limit_price: null,
    needs_reconcile: false,
    accessible_label: "AAPL MARKET order is FILLED",
    freshness: { ...baseFreshness, stale_after_seconds: 10, message: "If fills pause, flag for manual verification." }
  }
];

const mockOrderTypes: OrderTypesCatalog = {
  items: ["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]
};

const mockOrderEstimate: OrderEstimate = {
  ticker: "AAPL",
  order_type: "LIMIT",
  limit_price_suggestion: 199.65,
  estimated_total: 3.25,
  breakdown: {
    exchange_fee: 1.5,
    taker_maker_fee: 1.4,
    clearing_fee: 0.35
  },
  freshness: { ...baseFreshness, stale_after_seconds: 30, message: "Require confirmation if estimate is older than 10 seconds." }
};

const mockDepth: MarketDepthSnapshot = {
  ticker: "AAPL",
  bids: [
    { price: 199.55, size: 62 },
    { price: 199.5, size: 74 },
    { price: 199.45, size: 80 },
    { price: 199.4, size: 95 },
    { price: 199.35, size: 110 }
  ],
  asks: [
    { price: 199.65, size: 55 },
    { price: 199.7, size: 61 },
    { price: 199.75, size: 72 },
    { price: 199.8, size: 86 },
    { price: 199.85, size: 97 }
  ],
  delayed_overlay: false,
  freshness: { ...baseFreshness, stale_after_seconds: 1, message: "Show delayed market data overlay if feed lags." }
};

const mockTrades: TradesTape = {
  ticker: "AAPL",
  paused: false,
  freshness: { ...baseFreshness, stale_after_seconds: 5, message: "If stream disconnects, append paused row." },
  ticks: [
    { price: 199.6, size: 12, timestamp: "2026-06-08T14:30:00+00:00", side: "buy" },
    { price: 199.65, size: 25, timestamp: "2026-06-08T14:29:49+00:00", side: "buy" },
    { price: 199.57, size: 18, timestamp: "2026-06-08T14:29:38+00:00", side: "sell" }
  ]
};

const mockStats: MarketStats = {
  ticker: "AAPL",
  volume_24h: 1234567,
  last_trade_time: "2026-06-08T14:30:00+00:00",
  freshness: { ...baseFreshness, stale_after_seconds: 120, message: "If older than 2 minutes, show timestamp and gray value." }
};

const mockMeta: InstrumentMeta = {
  ticker: "AAPL",
  leverage: 3,
  restricted: false,
  restriction_reason: "",
  kyc_required: false
};

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("tradex-token") ?? "demo-user-1";
}

export function persistSession(session: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem("tradex-token", session.token);
  window.localStorage.setItem("tradex-user", JSON.stringify(session));
}

export function readStoredSession(): AuthResponse | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem("tradex-user");
  return raw ? (JSON.parse(raw) as AuthResponse) : null;
}

async function request<T>(path: string, init: RequestInit = {}, fallback: T): Promise<T> {
  try {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: "no-store",
      headers
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function signup(payload: { full_name: string; email: string; password: string }) {
  return request<AuthResponse>(
    "/auth/signup",
    { method: "POST", body: JSON.stringify(payload) },
    { token: "demo-user-1", user_id: "user-1", full_name: payload.full_name, email: payload.email }
  );
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify(payload) },
    { token: "demo-user-1", user_id: "user-1", full_name: "Demo Investor", email: payload.email }
  );
}

export async function getOverview(ticker: string) {
  return request<SymbolOverview>(`/symbols/${ticker}/overview`, {}, { ...mockOverview, ticker });
}

export async function getQuote(ticker: string) {
  return request<MarketQuote>(`/v1/market/quote?symbol=${ticker}`, {}, { ...mockQuote, ticker });
}

export async function getSignal(ticker: string) {
  return request<SignalResult>(`/symbols/${ticker}/signal`, {}, { ...mockSignal, ticker });
}

export async function getSentiment(ticker: string) {
  return request<SentimentResult>(`/symbols/${ticker}/sentiment`, {}, { ...mockSentiment, ticker });
}

export async function getWatchlist() {
  return request<{ items: WatchlistItem[] }>("/watchlist", {}, { items: mockWatchlist });
}

export async function addWatchlistItem(ticker: string) {
  const fallbackItem: WatchlistItem = {
    ticker,
    company_name: `${ticker} Corp.`,
    latest_price: 100,
    signal: "neutral",
    confidence: 0.5
  };
  return request<{ items: WatchlistItem[] }>(
    "/watchlist/items",
    { method: "POST", body: JSON.stringify({ ticker }) },
    { items: [...mockWatchlist, fallbackItem] }
  );
}

export async function analyzePortfolio(holdings: PortfolioHolding[]) {
  return request<PortfolioRiskReport>(
    "/portfolio/analyze",
    { method: "POST", body: JSON.stringify({ holdings }) },
    { ...mockPortfolioReport, holdings }
  );
}

export async function getAccountSummary() {
  return request<AccountSummary>("/v1/account/summary", {}, mockSummary);
}

export async function getRiskSnapshot() {
  return request<RiskSnapshot>("/v1/account/risk", {}, mockRisk);
}

export async function getComplianceStatus() {
  return request<ComplianceStatus>("/v1/account/flags", {}, mockCompliance);
}

export async function getPositions() {
  return request<{ positions: PositionSnapshot[] }>("/v1/portfolio/positions", {}, { positions: mockPositions });
}

export async function getOrders() {
  return request<{ orders: OrderRecord[] }>("/v1/orders?limit=50", {}, { orders: mockOrders });
}

export async function getOrderTypes() {
  return request<OrderTypesCatalog>("/config/order_types", {}, mockOrderTypes);
}

export async function estimateOrder(payload: {
  ticker: string;
  quantity: number;
  order_type: OrderType;
  limit_price?: number | null;
}) {
  return request<OrderEstimate>("/v1/orders/estimate", { method: "POST", body: JSON.stringify(payload) }, { ...mockOrderEstimate, ticker: payload.ticker, order_type: payload.order_type });
}

export async function getMarketDepth(ticker: string) {
  return request<MarketDepthSnapshot>(`/v1/market/depth?symbol=${ticker}`, {}, { ...mockDepth, ticker });
}

export async function getMarketStats(ticker: string) {
  return request<MarketStats>(`/v1/market/stats?symbol=${ticker}`, {}, { ...mockStats, ticker });
}

export async function getMarketTrades(ticker: string) {
  return request<TradesTape>(`/v1/market/trades?symbol=${ticker}`, {}, { ...mockTrades, ticker });
}

export async function getInstrumentMeta(ticker: string) {
  return request<InstrumentMeta>(`/v1/instruments/${ticker}/meta`, {}, { ...mockMeta, ticker });
}

export async function getAlerts() {
  return request<{ items: AlertRule[] }>("/alerts", {}, { items: mockAlerts });
}

export async function createAlert(payload: Omit<AlertRule, "alert_id" | "created_at">) {
  const fallback: { items: AlertRule[] } = {
    items: [
      ...mockAlerts,
      {
        ...payload,
        alert_id: `alert-${mockAlerts.length + 1}`,
        created_at: "2026-06-08T14:30:00+00:00"
      }
    ]
  };
  return request<{ items: AlertRule[] }>("/alerts", { method: "POST", body: JSON.stringify(payload) }, fallback);
}
