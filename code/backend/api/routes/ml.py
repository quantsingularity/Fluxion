"""
Prediction routes for Fluxion Backend.

Backs the mobile app's energy-prediction flow (PredictionForm -> predictEnergy
-> ResultsScreen). The request mirrors what the mobile client posts
(timestamps, meter_ids, context_features) and the response matches the shape
ResultsDisplay renders: per-meter prediction series plus confidence intervals.

The forecasting logic itself lives in ml_models (forecasting_models.py). This
route returns a deterministic, structured forecast so the integrated flow works
end to end; wire it to the ml-service / model inference when that is available.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class PredictionRequest(BaseModel):
    timestamps: List[str] = Field(..., min_length=1)
    meter_ids: List[str] = Field(..., min_length=1)
    context_features: Optional[Dict[str, Any]] = None


def _forecast_series(meter_id: str, n: int) -> List[float]:
    # Deterministic per-meter baseline so repeated calls are stable.
    base = (sum(ord(c) for c in meter_id) % 20) + 5.0
    return [round(base + i * 0.5, 4) for i in range(n)]


@router.post("/predict", summary="Predict energy consumption")
async def predict_energy(request: PredictionRequest):
    n = len(request.timestamps)
    predictions: Dict[str, List[float]] = {}
    confidence_intervals: Dict[str, List[List[float]]] = {}

    for meter_id in request.meter_ids:
        series = _forecast_series(meter_id, n)
        predictions[meter_id] = series
        # +/- 7% band as a simple confidence interval.
        confidence_intervals[meter_id] = [
            [round(v * 0.93, 4), round(v * 1.07, 4)] for v in series
        ]

    return {
        "predictions": predictions,
        "confidence_intervals": confidence_intervals,
        "model_version": "fluxion-forecast-v1",
    }
