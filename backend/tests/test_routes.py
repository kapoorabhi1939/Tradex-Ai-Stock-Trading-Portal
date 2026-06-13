from __future__ import annotations

import json
import unittest

from backend.app.routes import Application


class RouteTests(unittest.TestCase):
    def setUp(self) -> None:
        self.app = Application()

    def _post(self, path: str, payload: dict, token: str | None = None):
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return self.app.route_request(
            method="POST",
            path=path,
            body=json.dumps(payload).encode("utf-8"),
            headers=headers,
        )

    def _get(self, path: str, token: str | None = None, query_string: str = ""):
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        return self.app.route_request(method="GET", path=path, headers=headers, query_string=query_string)

    def test_signup_and_login(self) -> None:
        signup = self._post(
            "/auth/signup",
            {"full_name": "Casey Trader", "email": "casey@example.com", "password": "strongpass"},
        )
        self.assertEqual(signup.status_code, 201)
        token = signup.payload["token"]

        login = self._post("/auth/login", {"email": "casey@example.com", "password": "strongpass"})
        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.payload["token"], token)

    def test_watchlist_crud(self) -> None:
        token = "demo-user-1"
        initial = self._get("/watchlist", token=token)
        self.assertEqual(initial.status_code, 200)
        original_count = len(initial.payload["items"])

        updated = self._post("/watchlist/items", {"ticker": "AMZN"}, token=token)
        self.assertEqual(updated.status_code, 201)
        self.assertEqual(len(updated.payload["items"]), original_count + 1)

    def test_symbol_routes(self) -> None:
        overview = self._get("/symbols/AAPL/overview")
        signal = self._get("/symbols/AAPL/signal")
        sentiment = self._get("/symbols/AAPL/sentiment")
        self.assertEqual(overview.status_code, 200)
        self.assertEqual(signal.status_code, 200)
        self.assertEqual(sentiment.status_code, 200)
        self.assertEqual(signal.payload["ticker"], "AAPL")

    def test_portfolio_analysis(self) -> None:
        response = self._post(
            "/portfolio/analyze",
            {"holdings": [{"ticker": "AAPL", "shares": 5, "average_cost": 180}, {"ticker": "JPM", "shares": 8, "average_cost": 200}]},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("sector_exposure", response.payload)

    def test_alert_creation(self) -> None:
        token = "demo-user-1"
        response = self._post(
            "/alerts",
            {
                "ticker": "MSFT",
                "condition_type": "price_above",
                "threshold": 450,
                "delivery_channel": "email",
                "enabled": True,
            },
            token=token,
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(any(item["ticker"] == "MSFT" for item in response.payload["items"]))

    def test_registry_endpoints(self) -> None:
        token = "demo-user-1"
        summary = self._get("/v1/account/summary", token=token)
        positions = self._get("/v1/portfolio/positions", token=token)
        orders = self._get("/v1/orders", token=token, query_string="limit=50")
        self.assertEqual(summary.status_code, 200)
        self.assertIn("total_portfolio_value", summary.payload)
        self.assertEqual(positions.status_code, 200)
        self.assertTrue(len(positions.payload["positions"]) >= 1)
        self.assertEqual(orders.status_code, 200)
        self.assertTrue(any(order["status"] == "PARTIAL" for order in orders.payload["orders"]))

    def test_market_registry_routes(self) -> None:
        quote = self._get("/v1/market/quote", query_string="symbol=AAPL")
        depth = self._get("/v1/market/depth", query_string="symbol=AAPL")
        meta = self._get("/v1/instruments/AAPL/meta")
        self.assertEqual(quote.status_code, 200)
        self.assertEqual(depth.status_code, 200)
        self.assertEqual(meta.status_code, 200)
        self.assertEqual(quote.payload["ticker"], "AAPL")
        self.assertEqual(len(depth.payload["bids"]), 5)
        self.assertFalse(meta.payload["restricted"])


if __name__ == "__main__":
    unittest.main()
