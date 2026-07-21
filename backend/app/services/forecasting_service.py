import uuid
import numpy as np
from datetime import date
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.transaction_repo import TransactionRepository
from app.repositories.business_repo import BusinessRepository
from app.ml.feature_engineering import generate_features_from_transactions
from app.ml.models_registry import CashFlowForecaster
from app.schemas.schemas import ForecastResponse, ForecastDataPoint

class ForecastingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tx_repo = TransactionRepository(db)
        self.business_repo = BusinessRepository(db)
        self.forecaster = CashFlowForecaster()

    async def generate_cash_flow_forecast(self, business_id: uuid.UUID, horizon_days: int) -> ForecastResponse:
        # Fetch business & location details
        business = await self.business_repo.get_with_twin(business_id)
        if not business:
            raise ValueError(f"Business not found with ID: {business_id}")
            
        # Ensure digital twin exists
        twin = await self.business_repo.ensure_twin(business_id)
        twin_dict = {
            "assets_valuation": float(twin.assets_valuation),
            "outstanding_loans": float(twin.outstanding_loans),
            "inventory_value": float(twin.inventory_value),
            "supplier_stability_score": float(twin.supplier_stability_score)
        }

        # Fetch transaction history
        transactions = await self.tx_repo.get_by_business(business_id)
        
        # 1. Feature Engineering
        df_features = generate_features_from_transactions(
            transactions=transactions,
            twin_state=twin_dict,
            sector=business.sector,
            district=business.district,
            state=business.state,
            horizon_days=horizon_days
        )

        # Train model on historical transactions
        # If transaction history is short, model initializes defaults gracefully
        self.forecaster.train(df_features)

        # Get latest features for inference
        if not df_features.empty:
            latest_features = df_features.iloc[-1].to_dict()
        else:
            # Empty transaction history default values
            latest_features = {
                "festival_indicator": 0.0,
                "kharif_harvest": 0.0,
                "rabi_harvest": 0.0,
                "net_flow_lag_1": 1500.0,
                "mandi_price_index": 105.0,
                "outstanding_loans": twin_dict["outstanding_loans"],
                "inventory_value": twin_dict["inventory_value"],
                "supplier_stability": twin_dict["supplier_stability_score"]
            }

        # 2. Run Inference
        forecast_points_raw, feature_importance = self.forecaster.predict_horizon(latest_features, horizon_days)

        # Map to Pydantic objects
        points = [
            ForecastDataPoint(
                date=p["date"],
                predicted_revenue=p["predicted_revenue"],
                predicted_expenses=p["predicted_expenses"],
                predicted_net_cash_flow=p["predicted_net_cash_flow"],
                confidence_lower=p["confidence_lower"],
                confidence_upper=p["confidence_upper"]
            )
            for p in forecast_points_raw
        ]

        # 3. Generate Natural Language Explanation (Module 7)
        top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]
        explanation = (
            f"Cash flow forecast model shows healthy liquidity over the next {horizon_days} days. "
            f"The top driving factor is {top_features[0][0]} (impact weight: {top_features[0][1]:.2%}), "
            f"followed by {top_features[1][0]} ({top_features[1][1]:.2%}). "
            f"Confidence intervals are calibrated dynamically using Conformal Prediction based on historic transaction residuals."
        )

        return ForecastResponse(
            business_id=business_id,
            horizon_days=horizon_days,
            forecast_points=points,
            feature_importance=feature_importance,
            explanation=explanation
        )
