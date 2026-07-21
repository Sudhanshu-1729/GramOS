import uuid
import numpy as np
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories.business_repo import BusinessRepository
from app.repositories.transaction_repo import TransactionRepository
from app.services.forecasting_service import ForecastingService
from app.services.risk_service import RiskService
from app.models import Scheme, SchemeMatch
from app.schemas.schemas import RecommendationResponse, RecommendationItem, SchemeMatchResponse, SchemeMatchItem, SchemeResponse

# Static list of national/NABARD government schemes to populate the DB
DEFAULT_SCHEMES = [
    {
        "name": "Dairy Entrepreneurship Development Scheme (DEDS)",
        "provider": "NABARD",
        "description": "Provides financial assistance to set up modern dairy farms, purchase milking machines, and build dairy processing infrastructure. Open to agricultural and livestock sectors.",
        "eligibility_criteria": {"min_assets": 0.0, "max_outstanding_loans": 2000000.0, "allowed_sectors": ["Dairy", "Agriculture", "Livestock"]},
        "subsidy_percentage": 25.0,
        "max_amount": 700000.0,
        "sector_compatibility": ["Dairy", "Agriculture", "Livestock"]
    },
    {
        "name": "Agri-Clinics and Agri-Business Centres (ACABC) Scheme",
        "provider": "NABARD / Ministry of Agriculture",
        "description": "Supports graduates in agricultural science to set up commercial agri-ventures, clinics, and soil testing labs to support local farmers. Includes interest subventions and capital subsidies.",
        "eligibility_criteria": {"min_assets": 50000.0, "max_outstanding_loans": 1000000.0, "allowed_sectors": ["Agriculture", "Retail"]},
        "subsidy_percentage": 36.0,
        "max_amount": 2000000.0,
        "sector_compatibility": ["Agriculture", "Retail", "Services"]
    },
    {
        "name": "PM Formalisation of Micro Food Processing Enterprises (PMFME) Scheme",
        "provider": "Ministry of Food Processing Industries (MoFPI)",
        "description": "Offers seed capital, credit-linked subsidies, and marketing support for upgrading micro-food processing units like flour mills, spice grinding, and local fruit processing.",
        "eligibility_criteria": {"min_assets": 20000.0, "max_outstanding_loans": 1500000.0, "allowed_sectors": ["Food Processing", "Retail", "Agriculture"]},
        "subsidy_percentage": 35.0,
        "max_amount": 1000000.0,
        "sector_compatibility": ["Food Processing", "Retail", "Agriculture"]
    },
    {
        "name": "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
        "provider": "Ministry of MSME / SIDBI",
        "description": "Enables collateral-free credit flow to micro and small enterprises. Banks receive institutional guarantees up to 85% of the loan amount.",
        "eligibility_criteria": {"min_assets": 10000.0, "max_outstanding_loans": 5000000.0, "allowed_sectors": ["Retail", "Handloom", "Services", "Manufacturing"]},
        "subsidy_percentage": 0.0,
        "max_amount": 5000000.0,
        "sector_compatibility": ["Retail", "Handloom", "Services", "Manufacturing", "Dairy", "Agriculture"]
    }
]

class RecommendationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.business_repo = BusinessRepository(db)
        self.tx_repo = TransactionRepository(db)
        self.forecaster = ForecastingService(db)
        self.risk_service = RiskService(db)

    async def seed_schemes_if_empty(self):
        """Pre-populates the database with default schemes if none exist."""
        result = await self.db.execute(select(Scheme))
        if not result.scalars().first():
            for s in DEFAULT_SCHEMES:
                scheme = Scheme(
                    name=s["name"],
                    provider=s["provider"],
                    description=s["description"],
                    eligibility_criteria=s["eligibility_criteria"],
                    subsidy_percentage=s["subsidy_percentage"],
                    max_amount=s["max_amount"],
                    sector_compatibility=s["sector_compatibility"]
                )
                self.db.add(scheme)
            await self.db.flush()

    async def get_financial_recommendations(self, business_id: uuid.UUID) -> RecommendationResponse:
        """
        Module 4: Recommends actionable operational improvements (inventory, spending delays, loan repayments)
        by analyzing cash flow forecasts and risk structures.
        """
        business = await self.business_repo.get_with_twin(business_id)
        if not business:
            raise ValueError(f"Business not found: {business_id}")

        twin = await self.business_repo.ensure_twin(business_id)
        
        # Load risk assessments and forecasts
        risk = await self.risk_service.evaluate_risk(business_id)
        forecast = await self.forecaster.generate_cash_flow_forecast(business_id, horizon_days=30)
        
        recommendations = []

        # Heuristic Rule 1: Working Capital & Outflow spikes
        # Find if forecasted net cash flow dips below zero in the next 30 days
        negative_days = [p for p in forecast.forecast_points if p.predicted_net_cash_flow < 0]
        if negative_days:
            worst_dip = min([p.predicted_net_cash_flow for p in negative_days])
            recommendations.append(
                RecommendationItem(
                    action="Secure Short-Term Working Capital",
                    reason=f"Projected cash flow falls negative during the month (minimum dip of ₹{abs(worst_dip):,.2f}). Delay non-critical expenses or secure a credit line.",
                    priority="HIGH",
                    expected_financial_impact=float(abs(worst_dip) * 1.2),
                    confidence=0.88
                )
            )
            recommendations.append(
                RecommendationItem(
                    action="Delay Capital Purchases",
                    reason="Due to forecasted negative cash flow in the next 30 days, defer purchasing non-essential inventory or equipment to protect reserves.",
                    priority="MEDIUM",
                    expected_financial_impact=float(abs(worst_dip) * 0.5),
                    confidence=0.92
                )
            )

        # Heuristic Rule 2: Risk and Debt reduction
        if risk.risk_level in ["HIGH", "CRITICAL"]:
            recommendations.append(
                RecommendationItem(
                    action="Restructure High-Interest Borrowing",
                    reason=f"Current risk level is {risk.risk_level} with default probability at {risk.default_probability:.1%}. Consolidate or refinance high-interest local debt.",
                    priority="HIGH",
                    expected_financial_impact=float(twin.outstanding_loans * 0.15),
                    confidence=0.85
                )
            )
        
        # Heuristic Rule 3: Inventory Optimization (Agricultural Cycles)
        # Suggest inventory expansion prior to harvest season
        from app.ml.feature_engineering import get_festival_indicator
        import datetime
        today = datetime.date.today()
        upcoming_festive = any(get_festival_indicator(today + datetime.timedelta(days=d)) > 0 for d in range(30))
        
        if upcoming_festive and twin.inventory_value < 50000.0:
            recommendations.append(
                RecommendationItem(
                    action="Increase Procurement & Stocking",
                    reason="Major regional crop harvest / festival season is approaching. Procuring inventory now will prevent supply constraints and capture sales spikes.",
                    priority="HIGH",
                    expected_financial_impact=float(twin.inventory_value * 0.3),
                    confidence=0.90
                )
            )
        else:
            # Default fallback recommendation
            recommendations.append(
                RecommendationItem(
                    action="Optimize Cash Reserves",
                    reason="Keep at least 15% of monthly inflows in liquid digital cash accounts (like bank deposits) to capture interest and improve automated credit scores.",
                    priority="LOW",
                    expected_financial_impact=2000.0,
                    confidence=0.95
                )
            )

        return RecommendationResponse(business_id=business_id, recommendations=recommendations)

    async def match_government_schemes(self, business_id: uuid.UUID) -> SchemeMatchResponse:
        """
        Module 5: Matching algorithm that cross-references business category,
        asset valuation, outstanding debt, and district with NABARD and MSME scheme parameters.
        """
        business = await self.business_repo.get_with_twin(business_id)
        if not business:
            raise ValueError(f"Business not found: {business_id}")

        twin = await self.business_repo.ensure_twin(business_id)
        
        # Seed default schemes
        await self.seed_schemes_if_empty()
        
        # Query all available schemes
        stmt = select(Scheme)
        res = await self.db.execute(stmt)
        schemes = res.scalars().all()
        
        matches = []
        
        for scheme in schemes:
            score = 0.0
            reasons = []
            
            # 1. Sector Check
            sector_match = False
            for sec in scheme.sector_compatibility:
                if sec.lower() in business.sector.lower() or business.sector.lower() in sec.lower():
                    sector_match = True
                    break
                    
            if not sector_match:
                # Disqualified if sector is completely mismatched
                continue
            
            score += 0.50
            reasons.append(f"Compatible sector: business is in '{business.sector}' matches '{scheme.name}' targeting.")
            
            # 2. Asset limits check
            eligibility = scheme.eligibility_criteria
            min_assets = float(eligibility.get("min_assets", 0.0))
            if float(twin.assets_valuation) >= min_assets:
                score += 0.25
                reasons.append(f"Asset requirement met (assets ₹{float(twin.assets_valuation):,.2f} >= min ₹{min_assets:,.2f}).")
            else:
                score -= 0.20
                reasons.append(f"Warning: Business asset valuation (₹{float(twin.assets_valuation):,.2f}) is below target threshold.")

            # 3. Credit / Debt capacity check
            max_loans = float(eligibility.get("max_outstanding_loans", 99999999.0))
            if float(twin.outstanding_loans) <= max_loans:
                score += 0.25
                reasons.append("Debt leverage is within target limits.")
            else:
                score -= 0.25
                reasons.append("High debt exposure reduces match viability.")

            # Clip score between 0.0 and 1.0
            final_score = max(0.0, min(1.0, score))
            
            if final_score >= 0.50:
                scheme_resp = SchemeResponse(
                    id=scheme.id,
                    name=scheme.name,
                    provider=scheme.provider,
                    description=scheme.description,
                    subsidy_percentage=float(scheme.subsidy_percentage) if scheme.subsidy_percentage else None,
                    max_amount=float(scheme.max_amount) if scheme.max_amount else None,
                    sector_compatibility=scheme.sector_compatibility
                )
                
                matches.append(
                    SchemeMatchItem(
                        scheme=scheme_resp,
                        match_score=round(final_score, 4),
                        reasoning="; ".join(reasons)
                    )
                )

        # Sort by match score descending
        matches = sorted(matches, key=lambda x: x.match_score, reverse=True)
        
        # Save matches in background mapping if needed
        # (Usually dynamic, but caching in DB helps dashboard fast-loading)
        for m in matches:
            match_entry = SchemeMatch(
                business_id=business_id,
                scheme_id=m.scheme.id,
                match_score=m.match_score,
                reasoning=m.reasoning
            )
            self.db.add(match_entry)
            
        await self.db.flush()

        return SchemeMatchResponse(business_id=business_id, matches=matches)
