from __future__ import annotations

import unittest

from backend.jobs.normalize_data import normalize_news_rows, normalize_price_rows


class IngestionTests(unittest.TestCase):
    def test_deduplicates_price_rows(self) -> None:
        rows = [
            {
                "ticker": "aapl",
                "timestamp": "2026-06-05T13:31:00+00:00",
                "open": 100,
                "high": 101,
                "low": 99,
                "close": 100.5,
                "volume": 1000,
            },
            {
                "ticker": "AAPL",
                "timestamp": "2026-06-05T13:31:00+00:00",
                "open": 100,
                "high": 101,
                "low": 99,
                "close": 100.5,
                "volume": 1000,
            },
        ]
        normalized = normalize_price_rows(rows)
        self.assertEqual(len(normalized), 1)
        self.assertEqual(normalized[0]["ticker"], "AAPL")

    def test_filters_market_closed_rows(self) -> None:
        rows = [
            {
                "ticker": "AAPL",
                "timestamp": "2026-06-06T13:31:00+00:00",
                "open": 100,
                "high": 101,
                "low": 99,
                "close": 100.5,
                "volume": 1000,
            }
        ]
        self.assertEqual(normalize_price_rows(rows), [])

    def test_rejects_missing_symbol(self) -> None:
        rows = [
            {
                "timestamp": "2026-06-05T13:31:00+00:00",
                "open": 100,
                "high": 101,
                "low": 99,
                "close": 100.5,
                "volume": 1000,
            }
        ]
        with self.assertRaises(ValueError):
            normalize_price_rows(rows)

    def test_normalizes_news_rows(self) -> None:
        rows = [{"ticker": "msft", "headline": "Cloud demand accelerates", "published_at": "2026-06-05T12:00:00Z"}]
        normalized = normalize_news_rows(rows)
        self.assertEqual(normalized[0]["ticker"], "MSFT")
        self.assertIn("+00:00", normalized[0]["published_at"])


if __name__ == "__main__":
    unittest.main()

