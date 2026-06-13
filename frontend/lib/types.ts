export type SignalLabel = "bullish" | "neutral" | "bearish";
export type SentimentLabel = "positive" | "neutral" | "negative";
export type RiskSeverity = "low" | "medium" | "high";
export type ThresholdBand = "safe" | "warning" | "margin_call";
export type KycStatus = "verified" | "pending" | "blocked";
export type BannerLevel = "info" | "warning" | "critical";
export type OrderType = "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
export type OrderStatus = "DRAFT" | "PENDING" | "SUBMITTED" | "PARTIAL" | "FILLED" | "CANCELLED" | "REJECTED" | "EXPIRED";

export interface Freshness {
  updated_at: string;
  stale_after_seconds: number;
  is_stale: boolean;
  message: string;
}

export interface PriceBar {
  ticker: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolOverview {
  ticker: string;
  company_name: string;
  sector: string;
  latest_price: number;
  price_change: number;
  price_change_percent: number;
  description: string;
  recent_bars: PriceBar[];
}

export interface MarketQuote {
  ticker: string;
  mark_price: number;
  bid: number;
  ask: number;
  timestamp: string;
  freshness: Freshness;
}

export interface SignalResult {
  ticker: string;
  signal: SignalLabel;
  confidence: number;
  horizon: string;
  features_used: string[];
  generated_at: string;
  explanation: string;
}

export interface SentimentResult {
  ticker: string;
  score: number;
  label: SentimentLabel;
  headline_count: number;
  summary: string;
  generated_at: string;
}

export interface WatchlistItem {
  ticker: string;
  company_name: string;
  latest_price: number;
  signal: SignalLabel;
  confidence: number;
}

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  average_cost: number;
}

export interface PositionSnapshot {
  position_id: string;
  ticker: string;
  company_name: string;
  quantity: number;
  avg_entry_price: number;
  mark_price: number;
  unrealized_pl: number;
  leverage: number;
  delisted: boolean;
  freshness: Freshness;
  last_trade_time: string;
}

export interface RiskFlag {
  title: string;
  severity: RiskSeverity;
  detail: string;
}

export interface PortfolioRiskReport {
  holdings: PortfolioHolding[];
  sector_exposure: Record<string, number>;
  concentration_score: number;
  risk_flags: RiskFlag[];
  rebalance_suggestions: string[];
  portfolio_value: number;
  generated_at: string;
}

export interface AccountSummary {
  total_portfolio_value: number;
  day_change_pct: number;
  cash_available: number;
  ytd_return_pct: number;
  freshness: Freshness;
}

export interface RiskSnapshot {
  margin_level_pct: number;
  threshold_band: ThresholdBand;
  drawdown_used_pct: number;
  leverage_tier: "retail" | "professional";
  blocks_new_levered_orders: boolean;
  freshness: Freshness;
}

export interface ComplianceStatus {
  kyc_status: KycStatus;
  trading_restricted: boolean;
  restriction_scope: string;
  banner_level: BannerLevel;
  banner_text: string;
}

export interface AlertRule {
  alert_id: string;
  ticker: string;
  condition_type: "price_above" | "price_below" | "signal_change";
  threshold: number;
  delivery_channel: "email" | "in_app";
  enabled: boolean;
  created_at: string;
}

export interface OrderRecord {
  order_id: string;
  ticker: string;
  order_type: OrderType;
  status: OrderStatus;
  filled_quantity: number;
  total_quantity: number;
  limit_price: number | null;
  needs_reconcile: boolean;
  accessible_label: string;
  freshness: Freshness;
}

export interface OrderEstimate {
  ticker: string;
  order_type: OrderType;
  limit_price_suggestion: number;
  estimated_total: number;
  breakdown: Record<string, number>;
  freshness: Freshness;
}

export interface MarketDepthLevel {
  price: number;
  size: number;
}

export interface MarketDepthSnapshot {
  ticker: string;
  bids: MarketDepthLevel[];
  asks: MarketDepthLevel[];
  delayed_overlay: boolean;
  freshness: Freshness;
}

export interface TradeTick {
  price: number;
  size: number;
  timestamp: string;
  side: "buy" | "sell";
}

export interface TradesTape {
  ticker: string;
  ticks: TradeTick[];
  paused: boolean;
  freshness: Freshness;
}

export interface MarketStats {
  ticker: string;
  volume_24h: number;
  last_trade_time: string;
  freshness: Freshness;
}

export interface InstrumentMeta {
  ticker: string;
  leverage: number;
  restricted: boolean;
  restriction_reason: string;
  kyc_required: boolean;
}

export interface OrderTypesCatalog {
  items: OrderType[];
}

export interface AuthResponse {
  token: string;
  user_id: string;
  full_name: string;
  email: string;
}
