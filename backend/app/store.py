from __future__ import annotations

from dataclasses import dataclass, field

from .models import AlertRule, PortfolioHolding, TradeTick, UserProfile
from .seed_data import (
    DEFAULT_ACCOUNT_STATE,
    DEFAULT_ALERTS,
    DEFAULT_HOLDINGS,
    DEFAULT_INSTRUMENT_META,
    DEFAULT_ORDERS,
    DEFAULT_ORDER_TYPES,
    DEFAULT_WATCHLIST,
    DEMO_USER,
    LATEST_VOLUME_24H,
    NEWS_BY_TICKER,
    PRICE_BARS,
    SYMBOLS,
    TRADE_TICKS,
)


@dataclass
class InMemoryStore:
    users_by_id: dict[str, UserProfile] = field(default_factory=dict)
    users_by_email: dict[str, UserProfile] = field(default_factory=dict)
    watchlists: dict[str, list[str]] = field(default_factory=dict)
    alerts: dict[str, list[AlertRule]] = field(default_factory=dict)
    symbols: dict[str, dict[str, str]] = field(default_factory=dict)
    price_bars: dict[str, list] = field(default_factory=dict)
    news_by_ticker: dict[str, list[str]] = field(default_factory=dict)
    holdings_by_user: dict[str, list[PortfolioHolding]] = field(default_factory=dict)
    account_state_by_user: dict[str, dict] = field(default_factory=dict)
    orders_by_user: dict[str, list[dict]] = field(default_factory=dict)
    instrument_meta: dict[str, dict] = field(default_factory=dict)
    order_types: list[str] = field(default_factory=list)
    trade_ticks_by_ticker: dict[str, list[TradeTick]] = field(default_factory=dict)
    volume_24h_by_ticker: dict[str, float] = field(default_factory=dict)

    @classmethod
    def seeded(cls) -> "InMemoryStore":
        store = cls()
        store.users_by_id[DEMO_USER.user_id] = DEMO_USER
        store.users_by_email[DEMO_USER.email.lower()] = DEMO_USER
        store.watchlists = {user_id: list(tickers) for user_id, tickers in DEFAULT_WATCHLIST.items()}
        store.alerts = {
            user_id: [alert.model_copy(deep=True) for alert in rules] for user_id, rules in DEFAULT_ALERTS.items()
        }
        store.symbols = {ticker: dict(payload) for ticker, payload in SYMBOLS.items()}
        store.price_bars = {
            ticker: [bar.model_copy(deep=True) for bar in bars] for ticker, bars in PRICE_BARS.items()
        }
        store.news_by_ticker = {ticker: list(headlines) for ticker, headlines in NEWS_BY_TICKER.items()}
        store.holdings_by_user = {
            user_id: [holding.model_copy(deep=True) for holding in holdings]
            for user_id, holdings in DEFAULT_HOLDINGS.items()
        }
        store.account_state_by_user = {
            user_id: dict(payload) for user_id, payload in DEFAULT_ACCOUNT_STATE.items()
        }
        store.orders_by_user = {user_id: [dict(order) for order in orders] for user_id, orders in DEFAULT_ORDERS.items()}
        store.instrument_meta = {ticker: dict(meta) for ticker, meta in DEFAULT_INSTRUMENT_META.items()}
        store.order_types = list(DEFAULT_ORDER_TYPES)
        store.trade_ticks_by_ticker = {
            ticker: [tick.model_copy(deep=True) for tick in ticks] for ticker, ticks in TRADE_TICKS.items()
        }
        store.volume_24h_by_ticker = dict(LATEST_VOLUME_24H)
        return store
