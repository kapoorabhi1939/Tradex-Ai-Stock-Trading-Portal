from __future__ import annotations

from ..models import Freshness, PositionSnapshot
from ..seed_data import ANCHOR_TIME
from ..store import InMemoryStore
from .market import MarketService


class PositionService:
    def __init__(self, store: InMemoryStore, market_service: MarketService) -> None:
        self.store = store
        self.market_service = market_service

    def _freshness(self) -> Freshness:
        return Freshness(
            updated_at=ANCHOR_TIME,
            stale_after_seconds=5,
            is_stale=False,
            message="If quotes go stale for more than 5 seconds, gray out the derived P&L and show a timestamp.",
        )

    def list_positions(self, user_id: str) -> list[PositionSnapshot]:
        positions: list[PositionSnapshot] = []

        for index, holding in enumerate(self.store.holdings_by_user.get(user_id, []), start=1):
            symbol = holding.ticker.upper()
            quote = self.market_service.get_quote(symbol)
            company_name = self.store.symbols[symbol]["company_name"]
            leverage = self.store.instrument_meta[symbol]["leverage"]
            unrealized_pl = round((quote.mark_price - holding.average_cost) * holding.shares, 2)
            last_trade_time = self.store.trade_ticks_by_ticker[symbol][0].timestamp

            positions.append(
                PositionSnapshot(
                    position_id=f"pos-{index}",
                    ticker=symbol,
                    company_name=company_name,
                    quantity=holding.shares,
                    avg_entry_price=holding.average_cost,
                    mark_price=quote.mark_price,
                    unrealized_pl=unrealized_pl,
                    leverage=leverage,
                    delisted=False,
                    freshness=self._freshness(),
                    last_trade_time=last_trade_time,
                )
            )

        return positions
