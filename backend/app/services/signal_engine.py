from __future__ import annotations

from statistics import mean, pstdev

from ..models import PriceBar, SignalResult
from ..seed_data import ANCHOR_TIME


class SignalEngine:
    def generate(self, ticker: str, bars: list[PriceBar], sentiment_score: float) -> SignalResult:
        if len(bars) < 15:
            return SignalResult(
                ticker=ticker,
                signal="neutral",
                confidence=0.3,
                horizon="1-3 trading sessions",
                features_used=["insufficient_history"],
                generated_at=ANCHOR_TIME,
                explanation="Not enough market history was available to produce a strong signal.",
            )

        closes = [bar.close for bar in bars]
        short_ma = mean(closes[-5:])
        long_ma = mean(closes[-15:])
        momentum = (closes[-1] - closes[-6]) / closes[-6]
        returns = [
            (current - previous) / previous for previous, current in zip(closes[-10:-1], closes[-9:]) if previous
        ]
        volatility = pstdev(returns) if len(returns) > 1 else 0.0

        trend_component = (short_ma - long_ma) / long_ma
        volatility_penalty = min(volatility / 0.03, 1.0)
        score = (trend_component * 4.0) + (momentum * 3.0) + (sentiment_score * 0.8) - (volatility_penalty * 0.4)

        if score > 0.18:
            signal = "bullish"
        elif score < -0.18:
            signal = "bearish"
        else:
            signal = "neutral"

        confidence = min(0.95, max(0.35, abs(score) + 0.35))
        explanation = (
            f"Short momentum is {'above' if short_ma >= long_ma else 'below'} the medium trend, "
            f"{'supporting' if momentum >= 0 else 'pressuring'} the setup. "
            f"Sentiment contributes {sentiment_score:+.2f} while volatility remains {volatility:.3f}."
        )

        return SignalResult(
            ticker=ticker,
            signal=signal,
            confidence=round(confidence, 2),
            horizon="1-3 trading sessions",
            features_used=["short_moving_average", "long_moving_average", "five_bar_momentum", "realized_volatility"],
            generated_at=ANCHOR_TIME,
            explanation=explanation,
        )

