from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SignalLabel = Literal["bullish", "neutral", "bearish"]
SentimentLabel = Literal["positive", "neutral", "negative"]
DeliveryChannel = Literal["email", "in_app"]
ConditionType = Literal["price_above", "price_below", "signal_change"]
RiskSeverity = Literal["low", "medium", "high"]
KycStatus = Literal["verified", "pending", "blocked"]
LeverageTier = Literal["retail", "professional"]
OrderType = Literal["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]
OrderStatus = Literal["DRAFT", "PENDING", "SUBMITTED", "PARTIAL", "FILLED", "CANCELLED", "REJECTED", "EXPIRED"]
TradeSide = Literal["buy", "sell"]
ThresholdBand = Literal["safe", "warning", "margin_call"]
BannerLevel = Literal["info", "warning", "critical"]


class Freshness(BaseModel):
    updated_at: datetime
    stale_after_seconds: int
    is_stale: bool
    message: str


class PriceBar(BaseModel):
    ticker: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class SymbolOverview(BaseModel):
    ticker: str
    company_name: str
    sector: str
    latest_price: float
    price_change: float
    price_change_percent: float
    description: str
    recent_bars: list[PriceBar]


class MarketQuote(BaseModel):
    ticker: str
    mark_price: float
    bid: float
    ask: float
    timestamp: datetime
    freshness: Freshness


class SignalResult(BaseModel):
    ticker: str
    signal: SignalLabel
    confidence: float = Field(ge=0.0, le=1.0)
    horizon: str
    features_used: list[str]
    generated_at: datetime
    explanation: str


class SentimentResult(BaseModel):
    ticker: str
    score: float = Field(ge=-1.0, le=1.0)
    label: SentimentLabel
    headline_count: int
    summary: str
    generated_at: datetime


class UserProfile(BaseModel):
    user_id: str
    full_name: str
    email: str
    password_hash: str
    created_at: datetime


class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    full_name: str
    email: str


class WatchlistItem(BaseModel):
    ticker: str
    company_name: str
    latest_price: float
    signal: SignalLabel
    confidence: float = Field(ge=0.0, le=1.0)


class WatchlistAddRequest(BaseModel):
    ticker: str


class PortfolioHolding(BaseModel):
    ticker: str
    shares: float = Field(gt=0)
    average_cost: float = Field(gt=0)


class PositionSnapshot(BaseModel):
    position_id: str
    ticker: str
    company_name: str
    quantity: float
    avg_entry_price: float
    mark_price: float
    unrealized_pl: float
    leverage: float
    delisted: bool = False
    freshness: Freshness
    last_trade_time: datetime


class PortfolioAnalyzeRequest(BaseModel):
    holdings: list[PortfolioHolding]


class RiskFlag(BaseModel):
    title: str
    severity: RiskSeverity
    detail: str


class PortfolioRiskReport(BaseModel):
    holdings: list[PortfolioHolding]
    sector_exposure: dict[str, float]
    concentration_score: float = Field(ge=0.0, le=1.0)
    risk_flags: list[RiskFlag]
    rebalance_suggestions: list[str]
    portfolio_value: float
    generated_at: datetime


class AccountSummary(BaseModel):
    total_portfolio_value: float
    day_change_pct: float
    cash_available: float
    ytd_return_pct: float
    freshness: Freshness


class RiskSnapshot(BaseModel):
    margin_level_pct: float
    threshold_band: ThresholdBand
    drawdown_used_pct: float
    leverage_tier: LeverageTier
    blocks_new_levered_orders: bool
    freshness: Freshness


class ComplianceStatus(BaseModel):
    kyc_status: KycStatus
    trading_restricted: bool
    restriction_scope: str
    banner_level: BannerLevel
    banner_text: str


class AlertRule(BaseModel):
    alert_id: str
    ticker: str
    condition_type: ConditionType
    threshold: float
    delivery_channel: DeliveryChannel
    enabled: bool = True
    created_at: datetime


class AlertCreateRequest(BaseModel):
    ticker: str
    condition_type: ConditionType
    threshold: float
    delivery_channel: DeliveryChannel
    enabled: bool = True


class OrderRecord(BaseModel):
    order_id: str
    ticker: str
    order_type: OrderType
    status: OrderStatus
    filled_quantity: float
    total_quantity: float
    limit_price: float | None = None
    needs_reconcile: bool = False
    accessible_label: str
    freshness: Freshness


class OrderTypesCatalog(BaseModel):
    items: list[OrderType]


class OrderEstimateRequest(BaseModel):
    ticker: str
    quantity: float = Field(gt=0)
    order_type: OrderType
    limit_price: float | None = None


class OrderEstimate(BaseModel):
    ticker: str
    order_type: OrderType
    limit_price_suggestion: float
    estimated_total: float
    breakdown: dict[str, float]
    freshness: Freshness


class MarketDepthLevel(BaseModel):
    price: float
    size: float


class MarketDepthSnapshot(BaseModel):
    ticker: str
    bids: list[MarketDepthLevel]
    asks: list[MarketDepthLevel]
    delayed_overlay: bool
    freshness: Freshness


class TradeTick(BaseModel):
    price: float
    size: float
    timestamp: datetime
    side: TradeSide


class TradesTape(BaseModel):
    ticker: str
    ticks: list[TradeTick]
    paused: bool
    freshness: Freshness


class MarketStats(BaseModel):
    ticker: str
    volume_24h: float
    last_trade_time: datetime
    freshness: Freshness


class InstrumentMeta(BaseModel):
    ticker: str
    leverage: float
    restricted: bool
    restriction_reason: str
    kyc_required: bool
