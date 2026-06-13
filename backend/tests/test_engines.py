from __future__ import annotations

import unittest

from backend.app.models import PortfolioHolding
from backend.app.services.risk_engine import RiskEngine
from backend.app.services.sentiment_engine import SentimentEngine
from backend.app.services.signal_engine import SignalEngine
from backend.app.store import InMemoryStore


class EngineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.store = InMemoryStore.seeded()
        self.sentiment_engine = SentimentEngine()
        self.signal_engine = SignalEngine()
        self.risk_engine = RiskEngine()

    def test_signal_output_has_confidence_bounds(self) -> None:
        bars = self.store.price_bars["NVDA"]
        result = self.signal_engine.generate("NVDA", bars, sentiment_score=0.4)
        self.assertIn(result.signal, {"bullish", "neutral", "bearish"})
        self.assertGreaterEqual(result.confidence, 0.0)
        self.assertLessEqual(result.confidence, 1.0)
        self.assertTrue(result.explanation)

    def test_sentiment_defaults_to_neutral_for_empty_headlines(self) -> None:
        result = self.sentiment_engine.score("AAPL", [])
        self.assertEqual(result.label, "neutral")
        self.assertEqual(result.headline_count, 0)

    def test_risk_engine_flags_concentrated_portfolio(self) -> None:
        holdings = [
            PortfolioHolding(ticker="NVDA", shares=15, average_cost=110),
            PortfolioHolding(ticker="AAPL", shares=2, average_cost=190),
        ]
        report = self.risk_engine.analyze(
            holdings=holdings,
            latest_prices={ticker: bars[-1].close for ticker, bars in self.store.price_bars.items()},
            symbols=self.store.symbols,
            price_bars=self.store.price_bars,
        )
        self.assertGreater(report.concentration_score, 0.4)
        self.assertTrue(any(flag.title == "Concentration risk" for flag in report.risk_flags))


if __name__ == "__main__":
    unittest.main()

