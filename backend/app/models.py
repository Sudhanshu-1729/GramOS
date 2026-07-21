import uuid
from sqlalchemy import Column, String, DECIMAL, Integer, Boolean, DateTime, ForeignKey, Date, Text, Table, JSON, Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    sector = Column(String(100), nullable=False)  # Agriculture, Dairy, Retail, Handloom, etc.
    sub_sector = Column(String(100), nullable=True)
    latitude = Column(DECIMAL(9, 6), nullable=False)
    longitude = Column(DECIMAL(9, 6), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    transactions = relationship("Transaction", back_populates="business", cascade="all, delete-orphan")
    digital_twin = relationship("DigitalTwin", back_populates="business", uselist=False, cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="business", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="business", cascade="all, delete-orphan")
    scheme_matches = relationship("SchemeMatch", back_populates="business", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="business", cascade="all, delete-orphan")
    credit_memos = relationship("CreditMemo", back_populates="business", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    transaction_type = Column(String(10), nullable=False)  # INFLOW, OUTFLOW
    source = Column(String(50), nullable=False)  # UPI, Bank, Cash, Loan
    category = Column(String(100), nullable=False)  # Fertilizer, Labor, Inventory, Sales, etc.
    timestamp = Column(DateTime(timezone=True), nullable=False)
    invoice_ref = Column(String(255), nullable=True)
    is_anomaly = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business = relationship("Business", back_populates="transactions")


class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), unique=True, nullable=False)
    assets_valuation = Column(DECIMAL(15, 2), default=0.00)
    outstanding_loans = Column(DECIMAL(15, 2), default=0.00)
    inventory_value = Column(DECIMAL(15, 2), default=0.00)
    supplier_count = Column(Integer, default=0)
    customer_count = Column(Integer, default=0)
    supplier_stability_score = Column(DECIMAL(3, 2), default=1.00)
    last_sync = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    business = relationship("Business", back_populates="digital_twin")


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    forecast_date = Column(Date, nullable=False)
    horizon_days = Column(Integer, nullable=False)  # 7, 30, 60, 90
    predicted_revenue = Column(DECIMAL(15, 2), nullable=False)
    predicted_expenses = Column(DECIMAL(15, 2), nullable=False)
    predicted_net_cash_flow = Column(DECIMAL(15, 2), nullable=False)
    confidence_lower = Column(DECIMAL(15, 2), nullable=False)
    confidence_upper = Column(DECIMAL(15, 2), nullable=False)
    feature_importance = Column(JSON, nullable=True)  # { "feature_name": importance_value }
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business = relationship("Business", back_populates="forecasts")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    default_probability = Column(DECIMAL(5, 4), nullable=False)
    liquidity_risk = Column(DECIMAL(5, 4), nullable=False)
    financial_stress = Column(DECIMAL(5, 4), nullable=False)
    health_score = Column(Integer, nullable=False)  # 0 to 100
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    evidence = Column(JSON, nullable=True)  # Reasons, metric thresholds
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business = relationship("Business", back_populates="risk_assessments")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)  # NABARD, SIDBI, State Govt
    description = Column(Text, nullable=False)
    eligibility_criteria = Column(JSON, nullable=False)
    subsidy_percentage = Column(DECIMAL(5, 2), nullable=True)
    max_amount = Column(DECIMAL(15, 2), nullable=True)
    sector_compatibility = Column(JSON, nullable=False)  # list of strings

    matches = relationship("SchemeMatch", back_populates="scheme", cascade="all, delete-orphan")


class SchemeMatch(Base):
    __tablename__ = "scheme_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(DECIMAL(5, 4), nullable=False)
    reasoning = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business = relationship("Business", back_populates="scheme_matches")
    scheme = relationship("Scheme", back_populates="matches")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    document_type = Column(String(50), nullable=False)  # INVOICE, BANK_STATEMENT, GST_RETURN, LAND_RECORD
    status = Column(String(20), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    s3_uri = Column(String(512), nullable=True)
    extracted_data = Column(JSON, nullable=True)
    fraud_risk_score = Column(DECIMAL(5, 4), nullable=True)
    fraud_evidence = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business = relationship("Business", back_populates="documents")


class CreditMemo(Base):
    __tablename__ = "credit_memos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    memo_json = Column(JSON, nullable=False)
    overall_score = Column(Integer, nullable=False)
    decision = Column(String(20), nullable=False)  # APPROVE, REFER, REJECT
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business = relationship("Business", back_populates="credit_memos")
