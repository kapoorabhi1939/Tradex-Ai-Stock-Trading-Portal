from __future__ import annotations

from ..models import Freshness, OrderEstimate, OrderEstimateRequest, OrderRecord, OrderTypesCatalog
from ..seed_data import ANCHOR_TIME
from ..store import InMemoryStore
from .market import MarketService


class OrderService:
    def __init__(self, store: InMemoryStore, market_service: MarketService) -> None:
        self.store = store
        self.market_service = market_service

    def _freshness(self, *, stale_after_seconds: int, message: str) -> Freshness:
        return Freshness(
            updated_at=ANCHOR_TIME,
            stale_after_seconds=stale_after_seconds,
            is_stale=False,
            message=message,
        )

    def get_order_types(self) -> OrderTypesCatalog:
        return OrderTypesCatalog(items=list(self.store.order_types))

    def list_orders(self, user_id: str) -> list[OrderRecord]:
        orders: list[OrderRecord] = []
        for raw_order in self.store.orders_by_user.get(user_id, []):
            label = f"{raw_order['ticker']} {raw_order['order_type']} order is {raw_order['status']}"
            orders.append(
                OrderRecord(
                    order_id=raw_order["order_id"],
                    ticker=raw_order["ticker"],
                    order_type=raw_order["order_type"],
                    status=raw_order["status"],
                    filled_quantity=raw_order["filled_quantity"],
                    total_quantity=raw_order["total_quantity"],
                    limit_price=raw_order["limit_price"],
                    needs_reconcile=raw_order["needs_reconcile"],
                    accessible_label=label,
                    freshness=self._freshness(
                        stale_after_seconds=10,
                        message="If fill updates pause beyond 10 seconds, flag the order for manual verification.",
                    ),
                )
            )
        return orders

    def estimate(self, payload: dict) -> OrderEstimate:
        request = OrderEstimateRequest.model_validate(payload)
        quote = self.market_service.get_quote(request.ticker)
        limit_price_suggestion = round(request.limit_price or quote.ask, 2)

        exchange_fee = round(request.quantity * 0.02, 2)
        liquidity_fee = round(request.quantity * 0.015, 2)
        clearing_fee = 0.35
        estimated_total = round(exchange_fee + liquidity_fee + clearing_fee, 2)

        return OrderEstimate(
            ticker=request.ticker.upper(),
            order_type=request.order_type,
            limit_price_suggestion=limit_price_suggestion,
            estimated_total=estimated_total,
            breakdown={
                "exchange_fee": exchange_fee,
                "taker_maker_fee": liquidity_fee,
                "clearing_fee": clearing_fee,
            },
            freshness=self._freshness(
                stale_after_seconds=30,
                message="Require an explicit user confirmation if the estimate is older than 10 seconds.",
            ),
        )
