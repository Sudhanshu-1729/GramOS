import uuid
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.transaction_repo import TransactionRepository
from app.repositories.business_repo import BusinessRepository
from app.ml.feature_engineering import generate_features_from_transactions
from app.ml.models_registry import RiskClassifier
from app.models import RiskAssessment, Document
from app.schemas.schemas import RiskAssessmentResponse, FraudCheckResponse

class RiskService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tx_repo = TransactionRepository(db)
        self.business_repo = BusinessRepository(db)
        self.risk_classifier = RiskClassifier()

    async def evaluate_risk(self, business_id: uuid.UUID) -> RiskAssessmentResponse:
        business = await self.business_repo.get_with_twin(business_id)
        if not business:
            raise ValueError(f"Business not found: {business_id}")

        twin = await self.business_repo.ensure_twin(business_id)
        twin_dict = {
            "assets_valuation": float(twin.assets_valuation),
            "outstanding_loans": float(twin.outstanding_loans),
            "inventory_value": float(twin.inventory_value),
            "supplier_stability_score": float(twin.supplier_stability_score)
        }

        # 1. Gather historical context
        transactions = await self.tx_repo.get_by_business(business_id)
        
        # 2. Feature Engineering
        df_features = generate_features_from_transactions(
            transactions=transactions,
            twin_state=twin_dict,
            sector=business.sector,
            district=business.district,
            state=business.state
        )

        # Build training labels locally (mocking default indicators for local training)
        # If historical observations exist, train risk classifier dynamically
        if not df_features.empty and len(df_features) > 10:
            # Synthetic labels: default happens if net flow is heavily negative & debt is high
            y_labels = np.where(
                (df_features["net_flow_roll_mean_30"] < -1000) & 
                (df_features["outstanding_loans"] > df_features["assets_valuation"] * 0.4), 
                1, 0
            )
            # Ensure we have both classes present for training, otherwise mock train
            if len(np.unique(y_labels)) > 1:
                self.risk_classifier.train(df_features, y_labels)
            else:
                self.risk_classifier.train(pd.DataFrame(), np.array([]))
        else:
            self.risk_classifier.train(pd.DataFrame(), np.array([]))

        # Get latest observation vector
        if not df_features.empty:
            latest_features = df_features.iloc[-1].to_dict()
        else:
            latest_features = {
                "outstanding_loans": twin_dict["outstanding_loans"],
                "tx_velocity_7d": 1.0,
                "supplier_stability": twin_dict["supplier_stability_score"],
                "net_flow_roll_mean_30": 1000.0,
                "assets_valuation": twin_dict["assets_valuation"]
            }

        # 3. Model Inference & SHAP values
        default_prob, shap_values = self.risk_classifier.predict_risk(latest_features)

        # 4. Secondary Risk Calculations (Liquidity & Stress metrics)
        tx_stats = await self.tx_repo.get_stats_by_type(business_id)
        total_inflows = tx_stats.get("INFLOW", 0.0)
        total_outflows = tx_stats.get("OUTFLOW", 0.0)
        
        # Calculate date span of transactions to compute monthly averages
        if transactions:
            timestamps = [tx.timestamp for tx in transactions if tx.timestamp]
            if timestamps:
                min_t = min(timestamps)
                max_t = max(timestamps)
                days_span = (max_t - min_t).days
                months_span = max(1.0, days_span / 30.0)
            else:
                months_span = 1.0
        else:
            months_span = 1.0
            
        monthly_inflow = total_inflows / months_span

        # Liquidity Risk: ratio of outflow to inflow (higher = less liquid)
        if total_inflows > 0:
            liquidity_risk = min(1.0, total_outflows / (total_inflows + 1.0))
        else:
            liquidity_risk = 0.85 # High risk if no history of inflows

        # Financial Stress: combines debt-to-assets ratio with defaults
        debt_to_assets = twin_dict["outstanding_loans"] / (twin_dict["assets_valuation"] + 1.0)
        financial_stress = min(1.0, float(debt_to_assets * 1.5 + default_prob * 0.5))

        # Compute combined Business Health Score (0 - 100)
        # Higher is better: penalize for defaults, lack of liquidity, high stress
        health_score = int(100 - (default_prob * 40 + liquidity_risk * 30 + financial_stress * 30))
        health_score = max(0, min(100, health_score))

        # Classify risk level
        if health_score >= 80:
            risk_level = "LOW"
        elif health_score >= 60:
            risk_level = "MEDIUM"
        elif health_score >= 40:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # Construct structured explanations (Module 7)
        evidence = {
            "top_shap_contributors": shap_values,
            "debt_to_asset_ratio": round(float(debt_to_assets), 3),
            "liquidity_inflow_outflow_ratio": round(float(liquidity_risk), 3),
            "stress_index": round(float(financial_stress), 3),
            "historical_inflows": float(total_inflows),
            "historical_outflows": float(total_outflows),
            "monthly_inflow": float(monthly_inflow)
        }

        # Save assessment to database
        db_obj = RiskAssessment(
            business_id=business_id,
            default_probability=float(default_prob),
            liquidity_risk=float(liquidity_risk),
            financial_stress=float(financial_stress),
            health_score=health_score,
            risk_level=risk_level,
            evidence=evidence
        )
        self.db.add(db_obj)
        await self.db.flush()

        return RiskAssessmentResponse.model_validate(db_obj)

    async def detect_transaction_fraud(
        self,
        business_id: uuid.UUID,
        amount: float,
        source: str,
        category: str,
        timestamp: datetime
    ) -> FraudCheckResponse:
        """
        Module 3: Real-time transactional anomaly and fraud detection engine.
        Evaluates spending patterns, duplicate timings, and synthetic signals.
        """
        evidence = []
        fraud_score = 0.0

        # Fetch recent transactions to compute velocity limits
        recent_txs = await self.tx_repo.get_by_business(business_id, limit=50)

        # Check 1: Duplicate Transaction Detection
        # Check if there is another transaction of exact same amount and category in the last 15 minutes
        time_limit = timestamp - timedelta(minutes=15)
        duplicates = [
            tx for tx in recent_txs 
            if tx.amount == amount 
            and tx.category == category 
            and tx.timestamp >= time_limit
        ]
        if duplicates:
            fraud_score += 0.45
            evidence.append(f"Identical transaction of ₹{amount} detected within 15 minutes (Potential duplicate transaction fraud).")

        # Check 2: Transaction Velocity & Volume Anomalies (Isolation Forest style thresholding)
        if len(recent_txs) > 5:
            amounts = [float(tx.amount) for tx in recent_txs]
            mean_amt = np.mean(amounts)
            std_amt = np.std(amounts)
            # Outlier boundary: 3 standard deviations above mean
            if amount > mean_amt + 3 * std_amt:
                fraud_score += 0.35
                evidence.append(f"Transaction amount of ₹{amount} exceeds 3-sigma historic spending threshold (₹{mean_amt + 3*std_amt:.2f}).")
        
        # Check 3: Business Hour & Category mismatch
        # e.g., Fertilizer payments at 2:00 AM
        hour = timestamp.hour
        if (category.lower() in ["fertilizer", "seed", "machinery", "labor"]) and (hour < 5 or hour > 22):
            fraud_score += 0.15
            evidence.append(f"High-value rural procurement category '{category}' conducted outside local trading hours ({hour}:00).")

        # Cap score at 1.0
        fraud_score = min(1.0, fraud_score)
        
        return FraudCheckResponse(
            fraud_probability=round(fraud_score, 4),
            is_fraudulent=fraud_score >= 0.50,
            evidence=evidence
        )
