import uuid
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.business_repo import BusinessRepository
from app.services.forecasting_service import ForecastingService
from app.services.risk_service import RiskService
from app.services.twin_service import TwinService
from app.services.agent_boardroom_service import AgentBoardroomService
from app.models import CreditMemo
from app.schemas.schemas import CreditMemoResponse

class CreditMemoService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.business_repo = BusinessRepository(db)
        self.forecast_service = ForecastingService(db)
        self.risk_service = RiskService(db)
        self.twin_service = TwinService(db)
        self.boardroom_service = AgentBoardroomService(db)

    async def generate_credit_memo(
        self,
        business_id: uuid.UUID,
        loan_amount: float,
        tenure_months: int,
        interest_rate: float = 12.0
    ) -> CreditMemoResponse:
        """
        Module 6: Compiles risk, cash flow, digital twin, and LangGraph boardroom
        consensus opinions into an enterprise credit underwriting memo.
        """
        business = await self.business_repo.get_with_twin(business_id)
        if not business:
            raise ValueError(f"Business not found: {business_id}")

        # 1. Gather all analytical states
        twin = await self.twin_service.get_twin(business_id)
        risk = await self.risk_service.evaluate_risk(business_id)
        forecast = await self.forecast_service.generate_cash_flow_forecast(business_id, horizon_days=90)
        boardroom = await self.boardroom_service.run_boardroom_evaluation(
            business_id=business_id,
            loan_amount=loan_amount,
            tenure_months=tenure_months,
            interest_rate=interest_rate
        )

        # 2. Formulate SWOT Analysis based on metrics
        strengths = ["Strong local business presence in district.", f"Robust business health rating of {risk.health_score}/100."]
        weaknesses = []
        opportunities = ["Eligible for regional NABARD scheme interest subsidies."]
        threats = ["Exposed to localized monsoon weather variances."]

        if risk.default_probability > 0.20:
            weaknesses.append(f"Elevated default risk profile ({risk.default_probability:.1%}).")
        else:
            strengths.append("Low default risk expectation.")

        if float(twin.outstanding_loans) > float(twin.assets_valuation) * 0.4:
            weaknesses.append("Significant prior debt outstanding compared to assets.")
        else:
            strengths.append("Conservative leverage profile.")

        # 3. Formulate Underwriting JSON structure
        memo_content = {
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "underwriting_engine": "RuralOS AI Credit memo v1.0",
                "consensus_system": "LangGraph Stateful Boardroom"
            },
            "executive_summary": {
                "business_name": business.name,
                "sector": business.sector,
                "amount_requested": loan_amount,
                "tenure_months": tenure_months,
                "final_decision": boardroom.final_decision,
                "consensus_justification": boardroom.final_consensus_explanation
            },
            "financial_analysis": {
                "asset_valuation": float(twin.assets_valuation),
                "outstanding_debt": float(twin.outstanding_loans),
                "current_inventory": float(twin.inventory_value),
                "supplier_relationships": twin.supplier_count,
                "supplier_stability_index": float(twin.supplier_stability_score),
                "customer_size_estimate": twin.customer_count
            },
            "cash_flow_forecast": {
                "horizon_days": 90,
                "predicted_net_flow_sum": sum([float(p.predicted_net_cash_flow) for p in forecast.forecast_points]),
                "first_day_net_flow": float(forecast.forecast_points[0].predicted_net_cash_flow),
                "last_day_net_flow": float(forecast.forecast_points[-1].predicted_net_cash_flow),
                "model_explainability": forecast.explanation
            },
            "risk_analysis": {
                "default_probability": float(risk.default_probability),
                "liquidity_risk_index": float(risk.liquidity_risk),
                "financial_stress_index": float(risk.financial_stress),
                "shap_attributions": risk.evidence.get("top_shap_contributors", {})
            },
            "swot": {
                "strengths": strengths,
                "weaknesses": weaknesses,
                "opportunities": opportunities,
                "threats": threats
            },
            "evidence_references": {
                "historical_inflows": float(risk.evidence.get("historical_inflows", 0.0)),
                "historical_outflows": float(risk.evidence.get("historical_outflows", 0.0))
            },
            "monitoring_plan": [
                "Track daily UPI transaction inflows; flag if 7-day rolling velocity drops below 60%.",
                "Monitor wholesale mandi prices for sector crops on a weekly schedule.",
                "Conduct quarterly inventory value audits via mobile uploads."
            ]
        }

        # 4. Save to PostgreSQL
        credit_memo_db = CreditMemo(
            business_id=business_id,
            memo_json=memo_content,
            overall_score=risk.health_score,
            decision=boardroom.final_decision
        )
        self.db.add(credit_memo_db)
        await self.db.flush()

        return CreditMemoResponse(
            id=credit_memo_db.id,
            business_id=business_id,
            overall_score=risk.health_score,
            decision=boardroom.final_decision,
            memo_json=memo_content,
            created_at=credit_memo_db.created_at
        )
