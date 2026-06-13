from __future__ import annotations

from statistics import mean, pstdev

from ..models import PortfolioHolding, PortfolioRiskReport, PriceBar, RiskFlag
from ..seed_data import ANCHOR_TIME


class RiskEngine:
    def analyze(
        self,
        holdings: list[PortfolioHolding],
        latest_prices: dict[str, float],
        symbols: dict[str, dict[str, str]],
        price_bars: dict[str, list[PriceBar]],
    ) -> PortfolioRiskReport:
        values = {}
        total_value = 0.0
        for holding in holdings:
            latest_price = latest_prices.get(holding.ticker, holding.average_cost)
            position_value = latest_price * holding.shares
            values[holding.ticker] = position_value
            total_value += position_value

        total_value = round(total_value, 2)
        sector_values: dict[str, float] = {}
        weights: dict[str, float] = {}
        risk_flags: list[RiskFlag] = []

        for holding in holdings:
            weight = (values[holding.ticker] / total_value) if total_value else 0.0
            weights[holding.ticker] = weight
            sector = symbols.get(holding.ticker, {}).get("sector", "Unknown")
            sector_values[sector] = sector_values.get(sector, 0.0) + values[holding.ticker]

        sector_exposure = {
            sector: round(value / total_value, 2) if total_value else 0.0 for sector, value in sector_values.items()
        }
        concentration_score = round(sum(weight * weight for weight in weights.values()), 2)

        if len(holdings) < 3:
            risk_flags.append(
                RiskFlag(
                    title="Low diversification",
                    severity="high",
                    detail="The portfolio holds fewer than three names, increasing single-stock risk.",
                )
            )

        largest_weight = max(weights.values(), default=0.0)
        if largest_weight > 0.45:
            ticker = max(weights, key=weights.get)
            risk_flags.append(
                RiskFlag(
                    title="Concentration risk",
                    severity="high",
                    detail=f"{ticker} represents {largest_weight:.0%} of the portfolio, which is materially concentrated.",
                )
            )

        dominant_sector = max(sector_exposure, key=sector_exposure.get) if sector_exposure else None
        if dominant_sector and sector_exposure[dominant_sector] > 0.55:
            risk_flags.append(
                RiskFlag(
                    title="Sector concentration",
                    severity="medium",
                    detail=f"{dominant_sector} accounts for {sector_exposure[dominant_sector]:.0%} of portfolio value.",
                )
            )

        volatility_samples = []
        for ticker in weights:
            bars = price_bars.get(ticker, [])
            closes = [bar.close for bar in bars[-12:]]
            returns = [
                (current - previous) / previous for previous, current in zip(closes[:-1], closes[1:]) if previous
            ]
            if len(returns) > 1:
                volatility_samples.append(pstdev(returns))

        average_volatility = mean(volatility_samples) if volatility_samples else 0.0
        if average_volatility > 0.02:
            risk_flags.append(
                RiskFlag(
                    title="Elevated volatility",
                    severity="medium",
                    detail="Recent price swings imply above-average short-term volatility across current holdings.",
                )
            )

        if not risk_flags:
            risk_flags.append(
                RiskFlag(
                    title="Risk profile stable",
                    severity="low",
                    detail="No major concentration or volatility red flags were identified in the current mix.",
                )
            )

        suggestions: list[str] = []
        if largest_weight > 0.35:
            suggestions.append("Trim the largest position or add offsetting holdings to reduce concentration.")
        if dominant_sector and sector_exposure.get(dominant_sector, 0.0) > 0.45:
            suggestions.append(f"Add exposure outside {dominant_sector} to smooth sector-specific drawdowns.")
        if len(holdings) < 5:
            suggestions.append("Broaden the portfolio with additional sectors or defensive ETFs for diversification.")
        if not suggestions:
            suggestions.append("Maintain position sizing discipline and review signals as new data arrives.")

        return PortfolioRiskReport(
            holdings=holdings,
            sector_exposure=sector_exposure,
            concentration_score=concentration_score,
            risk_flags=risk_flags,
            rebalance_suggestions=suggestions,
            portfolio_value=total_value,
            generated_at=ANCHOR_TIME,
        )

