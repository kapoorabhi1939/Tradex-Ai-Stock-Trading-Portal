from __future__ import annotations

from datetime import timezone

from ..models import AlertCreateRequest, AlertRule
from ..seed_data import ANCHOR_TIME
from ..store import InMemoryStore
from .market import MarketService


class AlertService:
    def __init__(self, store: InMemoryStore, market_service: MarketService) -> None:
        self.store = store
        self.market_service = market_service

    def list_alerts(self, user_id: str) -> list[AlertRule]:
        return list(self.store.alerts.get(user_id, []))

    def create_alert(self, user_id: str, payload: dict) -> list[AlertRule]:
        request = AlertCreateRequest.model_validate(payload)
        self.market_service.get_overview(request.ticker)

        alert = AlertRule(
            alert_id=f"alert-{sum(len(items) for items in self.store.alerts.values()) + 1}",
            ticker=request.ticker.upper(),
            condition_type=request.condition_type,
            threshold=request.threshold,
            delivery_channel=request.delivery_channel,
            enabled=request.enabled,
            created_at=ANCHOR_TIME.astimezone(timezone.utc),
        )
        self.store.alerts.setdefault(user_id, []).append(alert)
        return self.list_alerts(user_id)
