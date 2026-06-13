from __future__ import annotations

from ..models import (
    Freshness,
    InstrumentMeta,
    MarketDepthLevel,
    MarketDepthSnapshot,
    MarketQuote,
    MarketStats,
    SentimentResult,
    SignalResult,
    SymbolOverview,
    TradesTape,
)
from ..seed_data import ANCHOR_TIME
from ..store import InMemoryStore
from .sentiment_engine import SentimentEngine
from .signal_engine import SignalEngine


class NotFoundError(ValueError):
    """Raised when a ticker or resource is unavailable."""


class MarketService:
    def __init__(self, store: InMemoryStore, sentiment_engine: SentimentEngine, signal_engine: SignalEngine) -> None:
        self.store = store
        self.sentiment_engine = sentiment_engine
        self.signal_engine = signal_engine

    def _require_ticker(self, ticker: str) -> str:
        normalized = ticker.upper()
        if normalized not in self.store.symbols:
            raise NotFoundError(f"Ticker {normalized} is not tracked in the demo dataset.")
        return normalized

    def _freshness(self, *, stale_after_seconds: int, message: str, is_stale: bool = False) -> Freshness:
        return Freshness(
            updated_at=ANCHOR_TIME,
            stale_after_seconds=stale_after_seconds,
            is_stale=is_stale,
            message=message,
        )

    def get_overview(self, ticker: str) -> SymbolOverview:
        symbol = self._require_ticker(ticker)
        meta = self.store.symbols[symbol]
        bars = self.store.price_bars[symbol]
        latest = bars[-1]
        previous = bars[-2]
        change = round(latest.close - previous.close, 2)
        change_pct = round((change / previous.close) * 100, 2) if previous.close else 0.0
        return SymbolOverview(
            ticker=symbol,
            company_name=meta["company_name"],
            sector=meta["sector"],
            latest_price=latest.close,
            price_change=change,
            price_change_percent=change_pct,
            description=meta["description"],
            recent_bars=bars[-20:],
        )

    def get_quote(self, ticker: str) -> MarketQuote:
        symbol = self._require_ticker(ticker)
        bars = self.store.price_bars[symbol]
        latest = bars[-1]
        return MarketQuote(
            ticker=symbol,
            mark_price=latest.close,
            bid=round(latest.close - 0.05, 2),
            ask=round(latest.close + 0.05, 2),
            timestamp=latest.timestamp,
            freshness=self._freshness(
                stale_after_seconds=3,
                message="If no updates arrive for 3 seconds, mark the quote as stale.",
            ),
        )

    def get_stats(self, ticker: str) -> MarketStats:
        symbol = self._require_ticker(ticker)
        last_trade_time = self.store.trade_ticks_by_ticker[symbol][0].timestamp
        return MarketStats(
            ticker=symbol,
            volume_24h=self.store.volume_24h_by_ticker[symbol],
            last_trade_time=last_trade_time,
            freshness=self._freshness(
                stale_after_seconds=120,
                message="If older than 2 minutes, show the timestamp and gray the value.",
            ),
        )

    def get_depth(self, ticker: str) -> MarketDepthSnapshot:
        symbol = self._require_ticker(ticker)
        mark_price = self.store.price_bars[symbol][-1].close
        bids = [MarketDepthLevel(price=round(mark_price - (0.05 * step), 2), size=50 + (step * 12)) for step in range(1, 6)]
        asks = [MarketDepthLevel(price=round(mark_price + (0.05 * step), 2), size=45 + (step * 10)) for step in range(1, 6)]
        return MarketDepthSnapshot(
            ticker=symbol,
            bids=bids,
            asks=asks,
            delayed_overlay=False,
            freshness=self._freshness(
                stale_after_seconds=1,
                message="Show a delayed market data overlay if depth lags materially behind the feed.",
            ),
        )

    def get_trades(self, ticker: str) -> TradesTape:
        symbol = self._require_ticker(ticker)
        return TradesTape(
            ticker=symbol,
            ticks=self.store.trade_ticks_by_ticker[symbol],
            paused=False,
            freshness=self._freshness(
                stale_after_seconds=5,
                message="If the trades stream pauses, append a paused marker and reconcile buffered events.",
            ),
        )

    def get_instrument_meta(self, ticker: str) -> InstrumentMeta:
        symbol = self._require_ticker(ticker)
        meta = self.store.instrument_meta[symbol]
        return InstrumentMeta(
            ticker=symbol,
            leverage=meta["leverage"],
            restricted=meta["restricted"],
            restriction_reason=meta["restriction_reason"],
            kyc_required=meta["kyc_required"],
        )

    def get_sentiment(self, ticker: str) -> SentimentResult:
        symbol = self._require_ticker(ticker)
        return self.sentiment_engine.score(symbol, self.store.news_by_ticker.get(symbol, []))

    def get_signal(self, ticker: str) -> SignalResult:
        symbol = self._require_ticker(ticker)
        sentiment = self.get_sentiment(symbol)
        return self.signal_engine.generate(symbol, self.store.price_bars[symbol], sentiment.score)

    def latest_prices(self) -> dict[str, float]:
        return {ticker: bars[-1].close for ticker, bars in self.store.price_bars.items() if bars}
