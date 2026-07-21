from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

# Base config for ORM compatibility
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# --- Business ---
class BusinessBase(BaseSchema):
    name: str
    sector: str
    sub_sector: Optional[str] = None
    latitude: float
    longitude: float
    district: str
    state: str

class BusinessCreate(BusinessBase):
    pass

class BusinessResponse(BusinessBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

# --- Transaction ---
class TransactionBase(BaseSchema):
    amount: float
    transaction_type: str = Field(..., description="INFLOW or OUTFLOW")
    source: str = Field(..., description="UPI, Bank, Cash, Loan")
    category: str = Field(..., description="Sales, Fertilizer, Labor, Inventory, etc.")
    timestamp: datetime
    invoice_ref: Optional[str] = None

class TransactionCreate(TransactionBase):
    business_id: UUID

class TransactionResponse(TransactionBase):
    id: UUID
    business_id: UUID
    is_anomaly: bool
    created_at: datetime

# --- Digital Twin ---
class DigitalTwinResponse(BaseSchema):
    id: UUID
    business_id: UUID
    assets_valuation: float
    outstanding_loans: float
    inventory_value: float
    supplier_count: int
    customer_count: int
    supplier_stability_score: float
    last_sync: datetime

# --- Cash Flow Forecast ---
class ForecastDataPoint(BaseSchema):
    date: date
    predicted_revenue: float
    predicted_expenses: float
    predicted_net_cash_flow: float
    confidence_lower: float
    confidence_upper: float

class ForecastResponse(BaseSchema):
    business_id: UUID
    horizon_days: int
    forecast_points: List[ForecastDataPoint]
    feature_importance: Dict[str, float] = Field(default_factory=dict)
    explanation: str

# --- Financial Risk ---
class RiskAssessmentResponse(BaseSchema):
    id: UUID
    business_id: UUID
    default_probability: float
    liquidity_risk: float
    financial_stress: float
    health_score: int
    risk_level: str
    evidence: Dict[str, Any]
    created_at: datetime

# --- Fraud Detection ---
class FraudCheckRequest(BaseSchema):
    transaction_id: Optional[UUID] = None
    invoice_metadata: Optional[Dict[str, Any]] = None

class FraudCheckResponse(BaseSchema):
    fraud_probability: float
    is_fraudulent: bool
    evidence: List[str] = Field(default_factory=list)

# --- Recommendations ---
class RecommendationItem(BaseSchema):
    action: str
    reason: str
    priority: str = Field(..., description="HIGH, MEDIUM, LOW")
    expected_financial_impact: float
    confidence: float

class RecommendationResponse(BaseSchema):
    business_id: UUID
    recommendations: List[RecommendationItem]

# --- Government Scheme recommendation ---
class SchemeResponse(BaseSchema):
    id: UUID
    name: str
    provider: str
    description: str
    subsidy_percentage: Optional[float] = None
    max_amount: Optional[float] = None
    sector_compatibility: List[str]

class SchemeMatchItem(BaseSchema):
    scheme: SchemeResponse
    match_score: float
    reasoning: str

class SchemeMatchResponse(BaseSchema):
    business_id: UUID
    matches: List[SchemeMatchItem]

# --- AI Credit Memo ---
class CreditMemoResponse(BaseSchema):
    id: UUID
    business_id: UUID
    overall_score: int
    decision: str
    memo_json: Dict[str, Any]
    created_at: datetime

# --- Scenario Simulation ---
class SimulationRequest(BaseModel):
    rainfall_change_percent: float = 0.0
    mandi_price_change_percent: float = 0.0
    loan_applied_amount: float = 0.0
    interest_rate_percent: float = 0.0
    subsidy_amount: float = 0.0
    inventory_change_percent: float = 0.0

class SimulationResponse(BaseModel):
    scenario: Dict[str, Any]
    original_risk_level: str
    simulated_risk_level: str
    original_health_score: int
    simulated_health_score: int
    original_net_cash_flow_30d: float
    simulated_net_cash_flow_30d: float
    trajectory: List[Dict[str, Any]]  # Day-by-day simulated outcomes
    impact_analysis: str

# --- Multi-Agent Boardroom ---
class BoardroomRequest(BaseModel):
    loan_amount: float
    tenure_months: int
    interest_rate: float = 12.0

class BoardroomAgentOpinion(BaseModel):
    agent: str
    decision: str  # APPROVE, REJECT, CONDITIONALLY_APPROVE
    reasoning: str
    metrics_evaluated: Dict[str, Any]

class BoardroomResponse(BaseModel):
    business_id: UUID
    loan_amount: float
    tenure_months: int
    final_decision: str  # APPROVE, REFER, REJECT
    final_consensus_explanation: str
    agent_opinions: List[BoardroomAgentOpinion]
    credit_memo_id: Optional[UUID] = None

# --- Document Intelligence ---
class DocumentUploadResponse(BaseSchema):
    id: UUID
    business_id: UUID
    filename: str
    document_type: str
    status: str
    created_at: datetime

class DocumentOCRResponse(BaseSchema):
    id: UUID
    business_id: UUID
    document_type: str
    extracted_data: Dict[str, Any]
    fraud_risk_score: float
    fraud_evidence: List[str]
    status: str

# --- Voice AI ---
class VoiceQueryRequest(BaseModel):
    language: str = Field("hi", description="Language code: hi, en, ta, te, kn, mr, etc.")
    audio_base64: Optional[str] = Field(None, description="Base64 encoded audio bytes")
    text_query: Optional[str] = Field(None, description="Text fallback if audio is transcribed on client")

class VoiceQueryResponse(BaseModel):
    language: str
    original_transcript: Optional[str]
    agent_text_response: str
    audio_response_base64: Optional[str] = None  # Base64 TTS output
