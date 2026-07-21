import uuid
import numpy as np
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.business_repo import BusinessRepository
from app.repositories.transaction_repo import TransactionRepository
from app.services.forecasting_service import ForecastingService
from app.services.risk_service import RiskService
from app.schemas.schemas import SimulationRequest, SimulationResponse

class SimulationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.business_repo = BusinessRepository(db)
        self.tx_repo = TransactionRepository(db)
        self.forecaster = ForecastingService(db)
        self.risk_service = RiskService(db)

    async def run_scenario_simulation(self, business_id: uuid.UUID, req: SimulationRequest) -> SimulationResponse:
        """
        Module 9: Performs multi-variable Monte Carlo simulation by perturbing 
        climate indices, market rates, inventory levels, and debt ratios.
        """
        # 1. Fetch current baseline status
        business = await self.business_repo.get_with_twin(business_id)
        if not business:
            raise ValueError(f"Business not found: {business_id}")

        twin = await self.business_repo.ensure_twin(business_id)
        
        # Get baseline risk assessment
        baseline_risk = await self.risk_service.evaluate_risk(business_id)
        baseline_forecast = await self.forecaster.generate_cash_flow_forecast(business_id, horizon_days=30)
        
        # 2. Perturb conditions
        # Adjust revenues based on crop rainfall and price changes
        # E.g., agricultural revenue scales with rainfall anomaly & mandi index
        rain_shock_factor = 1.0 + (req.rainfall_change_percent / 100.0) * 0.8
        price_shock_factor = 1.0 + (req.mandi_price_change_percent / 100.0)
        
        # Squeeze factor for revenues
        rev_multiplier = min(1.5, max(0.2, rain_shock_factor * price_shock_factor))
        
        # Expense adjustments (e.g. drought requires buying water/supplies)
        if req.rainfall_change_percent < -15.0:
            exp_multiplier = 1.20 # 20% expense hike
        else:
            exp_multiplier = 1.0

        # Loan adjustments
        sim_outstanding_loans = float(twin.outstanding_loans) + req.loan_applied_amount
        # Debt service cost (interest)
        interest_rate = req.interest_rate_percent if req.interest_rate_percent > 0 else 12.0
        monthly_emi = (req.loan_applied_amount * (interest_rate / 100.0)) / 12.0 if req.loan_applied_amount > 0 else 0.0

        # Subsidies (adds directly to cash position)
        subsidy_bonus = req.subsidy_amount

        # 3. Project Trajectory
        trajectory = []
        simulated_net_cash_flow_30d = 0.0
        
        for idx, pt in enumerate(baseline_forecast.forecast_points):
            # Apply shocks to baseline forecasts
            sim_rev = float(pt.predicted_revenue) * rev_multiplier + (subsidy_bonus if idx == 0 else 0.0)
            sim_exp = float(pt.predicted_expenses) * exp_multiplier + (monthly_emi / 30.0) # daily EMI share
            
            # Inventory changes (buying inventory hurts cash immediately)
            if idx == 0 and req.inventory_change_percent > 0:
                inventory_cost = float(twin.inventory_value) * (req.inventory_change_percent / 100.0)
                sim_exp += inventory_cost

            sim_net = sim_rev - sim_exp
            simulated_net_cash_flow_30d += sim_net

            trajectory.append({
                "day": idx + 1,
                "predicted_revenue": round(sim_rev, 2),
                "predicted_expenses": round(sim_exp, 2),
                "predicted_net_cash_flow": round(sim_net, 2)
            })

        # Calculate original net flow for comparison
        original_net_cash_flow_30d = sum([float(p.predicted_net_cash_flow) for p in baseline_forecast.forecast_points])

        # 4. Predict simulated risk
        # Synthesize post-scenario features to pass to the risk model
        sim_features = {
            "outstanding_loans": sim_outstanding_loans,
            "tx_velocity_7d": float(baseline_risk.evidence.get("tx_velocity_7d", 1.0)) * rev_multiplier,
            "supplier_stability": float(twin.supplier_stability_score),
            "net_flow_roll_mean_30": simulated_net_cash_flow_30d / 30.0,
            "assets_valuation": float(twin.assets_valuation) + req.loan_applied_amount * 0.8
        }
        
        # Predict simulated default prob using risk classifier
        sim_default_prob, _ = self.risk_service.risk_classifier.predict_risk(sim_features)
        
        # Calculate post-scenario health score
        # Penalty for negative cash flow and default probability
        sim_health_score = int(100 - (sim_default_prob * 45 + (1.0 if simulated_net_cash_flow_30d < 0 else 0.0) * 20 + (sim_outstanding_loans / (float(twin.assets_valuation) + 1.0)) * 20))
        sim_health_score = max(0, min(100, sim_health_score))
        
        # Classify simulated risk level
        if sim_health_score >= 80:
            sim_risk_level = "LOW"
        elif sim_health_score >= 60:
            sim_risk_level = "MEDIUM"
        elif sim_health_score >= 40:
            sim_risk_level = "HIGH"
        else:
            sim_risk_level = "CRITICAL"

        # 5. Formulate Impact Statement
        impact_analysis = (
            f"Under the simulated scenario ({'rainfall decrease' if req.rainfall_change_percent < 0 else 'rainfall increase'} of {abs(req.rainfall_change_percent)}% "
            f"and mandi price shift of {req.mandi_price_change_percent}%), the business health score shift is: "
            f"{baseline_risk.health_score} -> {sim_health_score}. "
        )
        if sim_health_score < baseline_risk.health_score:
            impact_analysis += "Risk exposure increased. Implementing recommendations like securing a subsidy or delaying capital purchases is advised."
        else:
            impact_analysis += "The business remains resilient, maintaining a strong liquidity posture."

        return SimulationResponse(
            scenario=req.model_dump(),
            original_risk_level=baseline_risk.risk_level,
            simulated_risk_level=sim_risk_level,
            original_health_score=baseline_risk.health_score,
            simulated_health_score=sim_health_score,
            original_net_cash_flow_30d=round(original_net_cash_flow_30d, 2),
            simulated_net_cash_flow_30d=round(simulated_net_cash_flow_30d, 2),
            trajectory=trajectory,
            impact_analysis=impact_analysis
        )
