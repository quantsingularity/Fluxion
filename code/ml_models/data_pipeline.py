from typing import Any

import pandas as pd
from sklearn.preprocessing import RobustScaler


class DataPipeline:

    def __init__(self) -> None:
        self.scaler = RobustScaler()
        self.features = [
            "volume",
            "price",
            "liquidity",
            "volatility",
            "arbitrage_opportunities",
        ]

    def transform(self, raw_data: Any) -> Any:
        df = pd.DataFrame(raw_data)
        df["price_velocity"] = df["price"].pct_change().fillna(0)
        liquidity_std = df["liquidity"].std()
        df["liquidity_zscore"] = (
            (df["liquidity"] - df["liquidity"].mean()) / liquidity_std
            if liquidity_std > 0
            else 0.0
        )
        df = df[(df["volume"] > 0) & (df["price"] > 0)].dropna(subset=self.features)
        if df.empty:
            return pd.DataFrame(columns=self.features)
        scaled = self.scaler.fit_transform(df[self.features])
        return pd.DataFrame(scaled, columns=self.features, index=df.index)
