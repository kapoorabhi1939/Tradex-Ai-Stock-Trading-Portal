from __future__ import annotations

from typing import Callable

from ..models import AccountSummary, ComplianceStatus, Freshness, RiskSnapshot
from ..seed_data import ANCHOR_TIME
from ..store import InMemoryStore


class AccountService:
    def __init__(self, store: InMemoryStore, latest_prices: Callable[[], dict[str, float]]) -> None:
        self.store = store
        self.latest_prices = latest_prices

    def _freshness(self, *, stale_after_seconds: int, message: str, is_stale: bool = False) -> Freshness:
        return Freshness(
            updated_at=ANCHOR_TIME,
            stale_after_seconds=stale_after_seconds,
            is_stale=is_stale,
            message=message,
        )

    def get_summary(self, user_id: str) -> AccountSummary:
        holdings = self.store.holdings_by_user.get(user_id, [])
        account_state = self.store.account_state_by_user[user_id]
        latest_prices = self.latest_prices()

        holdings_value = sum(holding.shares * latest_prices.get(holding.ticker, holding.average_cost) for holding in holdings)
        total_portfolio_value = round(holdings_value + account_state["cash_available"], 2)

        day_change_dollars = 0.0
        for holding in holdings:
            bars = self.store.price_bars[holding.ticker]
            latest = bars[-1].close
            previous = bars[-2].close
            day_change_dollars += (latest - previous) * holding.shares

        day_change_pct = round((day_change_dollars / total_portfolio_value) * 100, 1) if total_portfolio_value else 0.0

        return AccountSummary(
            total_portfolio_value=total_portfolio_value,
            day_change_pct=day_change_pct,
            cash_available=account_state["cash_available"],
            ytd_return_pct=account_state["ytd_return_pct"],
            freshness=self._freshness(
                stale_after_seconds=60,
                message="Disable trading calls to action if the account summary is older than 60 seconds.",
            ),
        )

    def get_risk(self, user_id: str) -> RiskSnapshot:
        account_state = self.store.account_state_by_user[user_id]
        margin_level_pct = account_state["margin_level_pct"]
        if margin_level_pct > 150:
            band = "safe"
        elif margin_level_pct >= 100:
            band = "warning"
        else:
            band = "margin_call"

        blocks_new_levered_orders = band == "margin_call"

        return RiskSnapshot(
            margin_level_pct=margin_level_pct,
            threshold_band=band,
            drawdown_used_pct=account_state["drawdown_used_pct"],
            leverage_tier=account_state["leverage_tier"],
            blocks_new_levered_orders=blocks_new_levered_orders,
            freshness=self._freshness(
                stale_after_seconds=5,
                message="If account risk data is stale for more than 5 seconds, prevent new levered orders.",
                is_stale=False,
            ),
        )

    def get_compliance(self, user_id: str) -> ComplianceStatus:
        account_state = self.store.account_state_by_user[user_id]
        return ComplianceStatus(
            kyc_status=account_state["kyc_status"],
            trading_restricted=account_state["trading_restricted"],
            restriction_scope=account_state["restriction_scope"],
            banner_level=account_state["banner_level"],
            banner_text=account_state["banner_text"],
        )
