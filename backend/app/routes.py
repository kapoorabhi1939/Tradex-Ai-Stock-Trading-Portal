from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any
from urllib.parse import parse_qs

from pydantic import ValidationError

from .models import PortfolioAnalyzeRequest, WatchlistAddRequest
from .services.account import AccountService
from .services.alerts import AlertService
from .services.auth import AuthenticationError, AuthService
from .services.market import MarketService, NotFoundError
from .services.orders import OrderService
from .services.positions import PositionService
from .services.risk_engine import RiskEngine
from .services.sentiment_engine import SentimentEngine
from .services.signal_engine import SignalEngine
from .services.watchlist import WatchlistService
from .store import InMemoryStore


@dataclass
class RouteResponse:
    status_code: int
    payload: dict[str, Any]


class Application:
    def __init__(self, store: InMemoryStore | None = None) -> None:
        self.store = store or InMemoryStore.seeded()
        self.auth_service = AuthService(self.store)
        self.sentiment_engine = SentimentEngine()
        self.signal_engine = SignalEngine()
        self.market_service = MarketService(self.store, self.sentiment_engine, self.signal_engine)
        self.watchlist_service = WatchlistService(self.store, self.market_service)
        self.alert_service = AlertService(self.store, self.market_service)
        self.risk_engine = RiskEngine()
        self.account_service = AccountService(self.store, self.market_service.latest_prices)
        self.position_service = PositionService(self.store, self.market_service)
        self.order_service = OrderService(self.store, self.market_service)

    def route_request(
        self,
        method: str,
        path: str,
        query_string: str = "",
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> RouteResponse:
        method = method.upper()
        headers = {key.lower(): value for key, value in (headers or {}).items()}
        data = json.loads(body.decode("utf-8")) if body else {}
        query = parse_qs(query_string)

        try:
            if method == "GET" and path == "/health":
                return RouteResponse(200, {"status": "ok"})

            if method == "POST" and path == "/auth/signup":
                auth = self.auth_service.signup(data)
                return RouteResponse(201, auth.model_dump(mode="json"))

            if method == "POST" and path == "/auth/login":
                auth = self.auth_service.login(data)
                return RouteResponse(200, auth.model_dump(mode="json"))

            if method == "GET" and path == "/watchlist":
                user_id = self._resolve_user_id(headers, query)
                items = self.watchlist_service.list_items(user_id)
                return RouteResponse(200, {"items": [item.model_dump(mode="json") for item in items]})

            if method == "POST" and path == "/watchlist/items":
                user_id = self._resolve_user_id(headers, query)
                request = WatchlistAddRequest.model_validate(data)
                items = self.watchlist_service.add_item(user_id, request.ticker)
                return RouteResponse(201, {"items": [item.model_dump(mode="json") for item in items]})

            if method == "POST" and path == "/portfolio/analyze":
                request = PortfolioAnalyzeRequest.model_validate(data)
                report = self.risk_engine.analyze(
                    holdings=request.holdings,
                    latest_prices=self.market_service.latest_prices(),
                    symbols=self.store.symbols,
                    price_bars=self.store.price_bars,
                )
                return RouteResponse(200, report.model_dump(mode="json"))

            if method == "GET" and path == "/v1/portfolio/positions":
                user_id = self._resolve_user_id(headers, query)
                positions = self.position_service.list_positions(user_id)
                return RouteResponse(200, {"positions": [position.model_dump(mode="json") for position in positions]})

            if method == "GET" and path == "/alerts":
                user_id = self._resolve_user_id(headers, query)
                alerts = self.alert_service.list_alerts(user_id)
                return RouteResponse(200, {"items": [item.model_dump(mode="json") for item in alerts]})

            if method == "POST" and path == "/alerts":
                user_id = self._resolve_user_id(headers, query)
                alerts = self.alert_service.create_alert(user_id, data)
                return RouteResponse(201, {"items": [item.model_dump(mode="json") for item in alerts]})

            if method == "GET" and path == "/v1/account/summary":
                user_id = self._resolve_user_id(headers, query)
                summary = self.account_service.get_summary(user_id)
                return RouteResponse(200, summary.model_dump(mode="json"))

            if method == "GET" and path == "/v1/account/balance":
                user_id = self._resolve_user_id(headers, query)
                summary = self.account_service.get_summary(user_id)
                return RouteResponse(
                    200,
                    {
                        "cash_available": summary.cash_available,
                        "freshness": summary.freshness.model_dump(mode="json"),
                    },
                )

            if method == "GET" and path == "/v1/account/risk":
                user_id = self._resolve_user_id(headers, query)
                risk = self.account_service.get_risk(user_id)
                return RouteResponse(200, risk.model_dump(mode="json"))

            if method == "GET" and path == "/v1/account/flags":
                user_id = self._resolve_user_id(headers, query)
                compliance = self.account_service.get_compliance(user_id)
                return RouteResponse(200, compliance.model_dump(mode="json"))

            if method == "GET" and path == "/v1/account/performance":
                user_id = self._resolve_user_id(headers, query)
                summary = self.account_service.get_summary(user_id)
                return RouteResponse(
                    200,
                    {
                        "range": query.get("range", ["YTD"])[0],
                        "ytd_return_pct": summary.ytd_return_pct,
                        "freshness": summary.freshness.model_dump(mode="json"),
                    },
                )

            if method == "GET" and path == "/v1/orders":
                user_id = self._resolve_user_id(headers, query)
                orders = self.order_service.list_orders(user_id)
                return RouteResponse(200, {"orders": [order.model_dump(mode="json") for order in orders]})

            if method == "POST" and path == "/v1/orders/estimate":
                estimate = self.order_service.estimate(data)
                return RouteResponse(200, estimate.model_dump(mode="json"))

            if method == "GET" and path == "/config/order_types":
                order_types = self.order_service.get_order_types()
                return RouteResponse(200, order_types.model_dump(mode="json"))

            if method == "GET" and path.startswith("/v1/orders/") and path.endswith("/fills"):
                user_id = self._resolve_user_id(headers, query)
                order_id = path.split("/")[3]
                orders = {order.order_id: order for order in self.order_service.list_orders(user_id)}
                if order_id not in orders:
                    raise NotFoundError(f"Order {order_id} is not available.")
                order = orders[order_id]
                return RouteResponse(
                    200,
                    {
                        "order_id": order.order_id,
                        "filled_quantity": order.filled_quantity,
                        "status": order.status,
                        "freshness": order.freshness.model_dump(mode="json"),
                    },
                )

            if method == "GET" and path == "/v1/market/quote":
                symbol = self._require_query(query, "symbol")
                quote = self.market_service.get_quote(symbol)
                return RouteResponse(200, quote.model_dump(mode="json"))

            if method == "GET" and path == "/v1/market/depth":
                symbol = self._require_query(query, "symbol")
                depth = self.market_service.get_depth(symbol)
                return RouteResponse(200, depth.model_dump(mode="json"))

            if method == "GET" and path == "/v1/market/stats":
                symbol = self._require_query(query, "symbol")
                stats = self.market_service.get_stats(symbol)
                return RouteResponse(200, stats.model_dump(mode="json"))

            if method == "GET" and path == "/v1/market/trades":
                symbol = self._require_query(query, "symbol")
                trades = self.market_service.get_trades(symbol)
                return RouteResponse(200, trades.model_dump(mode="json"))

            if method == "GET" and path.startswith("/v1/instruments/"):
                ticker, suffix = self._parse_instrument_path(path)
                instrument_meta = self.market_service.get_instrument_meta(ticker)
                if suffix == "meta":
                    return RouteResponse(200, instrument_meta.model_dump(mode="json"))
                if suffix == "restrictions":
                    return RouteResponse(
                        200,
                        {
                            "ticker": instrument_meta.ticker,
                            "restricted": instrument_meta.restricted,
                            "restriction_reason": instrument_meta.restriction_reason,
                        },
                    )

            if method == "GET" and path.startswith("/symbols/"):
                ticker, suffix = self._parse_symbol_path(path)
                if suffix == "overview":
                    overview = self.market_service.get_overview(ticker)
                    return RouteResponse(200, overview.model_dump(mode="json"))
                if suffix == "signal":
                    signal = self.market_service.get_signal(ticker)
                    return RouteResponse(200, signal.model_dump(mode="json"))
                if suffix == "sentiment":
                    sentiment = self.market_service.get_sentiment(ticker)
                    return RouteResponse(200, sentiment.model_dump(mode="json"))

            return RouteResponse(404, {"error": "Route not found."})
        except ValidationError as error:
            return RouteResponse(422, {"error": "Validation failed.", "details": error.errors()})
        except AuthenticationError as error:
            return RouteResponse(401, {"error": str(error)})
        except NotFoundError as error:
            return RouteResponse(404, {"error": str(error)})
        except ValueError as error:
            return RouteResponse(400, {"error": str(error)})

    def _resolve_user_id(self, headers: dict[str, str], query: dict[str, list[str]]) -> str:
        authorization = headers.get("authorization")
        if authorization:
            return self.auth_service.resolve_user(authorization).user_id

        user_id = query.get("user_id", [None])[0]
        if not user_id:
            raise AuthenticationError("A demo auth token is required for this route.")
        return user_id

    @staticmethod
    def _require_query(query: dict[str, list[str]], key: str) -> str:
        value = query.get(key, [None])[0]
        if not value:
            raise ValueError(f"Missing required query parameter: {key}")
        return value

    @staticmethod
    def _parse_symbol_path(path: str) -> tuple[str, str]:
        parts = [part for part in path.split("/") if part]
        if len(parts) != 3:
            raise NotFoundError("Symbol route is incomplete.")
        _, ticker, suffix = parts
        return ticker, suffix

    @staticmethod
    def _parse_instrument_path(path: str) -> tuple[str, str]:
        parts = [part for part in path.split("/") if part]
        if len(parts) != 4:
            raise NotFoundError("Instrument route is incomplete.")
        _, _, ticker, suffix = parts
        return ticker, suffix
