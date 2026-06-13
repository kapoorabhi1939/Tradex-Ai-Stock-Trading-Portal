from __future__ import annotations

from ..models import WatchlistItem
from ..store import InMemoryStore
from .market import MarketService


class WatchlistService:
    def __init__(self, store: InMemoryStore, market_service: MarketService) -> None:
        self.store = store
        self.market_service = market_service

    def list_items(self, user_id: str) -> list[WatchlistItem]:
        items = []
        for ticker in self.store.watchlists.get(user_id, []):
            overview = self.market_service.get_overview(ticker)
            signal = self.market_service.get_signal(ticker)
            items.append(
                WatchlistItem(
                    ticker=ticker,
                    company_name=overview.company_name,
                    latest_price=overview.latest_price,
                    signal=signal.signal,
                    confidence=signal.confidence,
                )
            )
        return items

    def add_item(self, user_id: str, ticker: str) -> list[WatchlistItem]:
        normalized = ticker.upper()
        self.market_service.get_overview(normalized)
        watchlist = self.store.watchlists.setdefault(user_id, [])
        if normalized not in watchlist:
            watchlist.append(normalized)
        return self.list_items(user_id)

