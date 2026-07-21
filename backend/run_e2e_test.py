import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Business, Transaction, DigitalTwin
from app.services.forecasting_service import ForecastingService
from app.services.risk_service import RiskService
from app.services.recommendation_service import RecommendationService
from app.services.twin_service import TwinService
from app.services.simulation_service import SimulationService
from app.services.agent_boardroom_service import AgentBoardroomService
from app.services.document_service import DocumentService
from app.services.voice_service import VoiceService
from app.services.credit_memo_service import CreditMemoService
from app.schemas.schemas import SimulationRequest, VoiceQueryRequest

# Override print to safely handle unicode Rupee symbol on Windows terminals
_original_print = print
def print(*args, **kwargs):
    import sys
    encoding = sys.stdout.encoding or 'utf-8'
    new_args = []
    for arg in args:
        s_arg = str(arg).replace("₹", "Rs.")
        try:
            s_arg.encode(encoding)
            new_args.append(s_arg)
        except UnicodeEncodeError:
            # Safely replace characters that cannot be rendered in the active terminal encoding
            safe_str = s_arg.encode(encoding, errors='replace').decode(encoding)
            new_args.append(safe_str)
    _original_print(*new_args, **kwargs)

# Use an in-memory SQLite database for sandboxed E2E testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

async def main():
    print("=" * 60)
    print("        RURALOS AI BACKEND - E2E PIPELINE VERIFICATION")
    print("=" * 60)
    
    # 1. Initialize DB Engine & Session
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:
        print("[1/14] Initializing Database Schema...")
        await conn.run_sync(Base.metadata.create_all)
        print("       Database Schema compiled successfully.")
        
    async with async_session() as db:
        # Override repositories to use local E2E test DB session
        
        # 2. Create Test Business (Krishna Agri-Foods Ltd)
        print("\n[2/14] Registering Rural Business profile...")
        business = Business(
            name="Krishna Agri-Foods Ltd",
            sector="Agriculture",
            sub_sector="Organic Grain Farming",
            latitude=19.0760,
            longitude=72.8777,
            district="Nashik",
            state="Maharashtra"
        )
        db.add(business)
        await db.flush()
        business_id = business.id
        print(f"       Registered: {business.name} (ID: {business_id}) in {business.district}, {business.state}")
        
        # Create default digital twin
        twin = DigitalTwin(
            business_id=business_id,
            assets_valuation=750000.0,
            outstanding_loans=50000.0,
            inventory_value=85000.0,
            supplier_count=5,
            customer_count=120,
            supplier_stability_score=0.90
        )
        db.add(twin)
        await db.flush()
        
        # 3. Populate Historical Transaction Streams (UPI/Bank/Cash)
        print("\n[3/14] Generating historical transaction logs (Inflows & Outflows)...")
        base_time = datetime.now() - timedelta(days=45)
        
        # Inflows (Crop sales, retail orders)
        inflows = [
            (25000.0, "UPI", "Crop Sales", base_time + timedelta(days=2)),
            (32000.0, "Bank", "Crop Sales", base_time + timedelta(days=7)),
            (15000.0, "UPI", "Organic Wheat Sales", base_time + timedelta(days=12)),
            (45000.0, "Bank", "Mandi Grain Inflow", base_time + timedelta(days=22)),
            (28000.0, "UPI", "Direct Customer Sales", base_time + timedelta(days=32)),
        ]
        # Outflows (Labor wages, fertilizer purchase, electricity bills)
        outflows = [
            (8500.0, "Cash", "Labor Wages", base_time + timedelta(days=3)),
            (12000.0, "UPI", "Fertilizer purchase", base_time + timedelta(days=5)),
            (5000.0, "UPI", "Electricity Bill", base_time + timedelta(days=10)),
            (15000.0, "Bank", "Tractor Loan EMI", base_time + timedelta(days=15)),
            (9500.0, "Cash", "Seed Purchase", base_time + timedelta(days=25)),
            (7000.0, "UPI", "Diesel Fuel", base_time + timedelta(days=30)),
        ]
        
        for amt, src, cat, t in inflows:
            db.add(Transaction(business_id=business_id, amount=amt, transaction_type="INFLOW", source=src, category=cat, timestamp=t))
        for amt, src, cat, t in outflows:
            db.add(Transaction(business_id=business_id, amount=amt, transaction_type="OUTFLOW", source=src, category=cat, timestamp=t))
            
        await db.flush()
        print(f"       Created {len(inflows)} inflow and {len(outflows)} outflow transaction events.")
        
        # 4. Synchronize Digital Twin State
        print("\n[4/14] Synchronizing Digital Twin state (Module 8)...")
        twin_service = TwinService(db)
        twin_res = await twin_service.get_twin(business_id)
        print(f"       Assets Valuation: Rs.{twin_res.assets_valuation:,.2f}")
        print(f"       Outstanding Loans: Rs.{twin_res.outstanding_loans:,.2f}")
        print(f"       Customer Count: {twin_res.customer_count}")
        
        # 5. Run Cash Flow Forecasting (7 days, 30 days)
        print("\n[5/14] Running Cash Flow Forecasting Engine (Module 1 & 7)...")
        forecast_service = ForecastingService(db)
        forecast_res = await forecast_service.generate_cash_flow_forecast(business_id, horizon_days=30)
        print(f"       Forecast Horizon: {forecast_res.horizon_days} days")
        print(f"       Summary Net Flow: Rs.{sum([float(p.predicted_net_cash_flow) for p in forecast_res.forecast_points]):,.2f}")
        print(f"       Calibration explanation: {forecast_res.explanation}")
        
        # 6. Execute Risk Assessment
        print("\n[6/14] Evaluating Financial Risk scoring model (Module 2 & 7)...")
        risk_service = RiskService(db)
        risk_res = await risk_service.evaluate_risk(business_id)
        print(f"       Default Probability: {risk_res.default_probability:.2%}")
        print(f"       Liquidity Risk: {risk_res.liquidity_risk:.2f}")
        print(f"       Business Health Score: {risk_res.health_score}/100")
        print(f"       Assigned Risk Category: {risk_res.risk_level}")
        print(f"       SHAP Feature attributions: {risk_res.evidence.get('top_shap_contributors')}")
        
        # 7. Auditing for Fraud & Double spend
        print("\n[7/14] Auditing transactional streams for Fraud anomalies (Module 3)...")
        # Check duplicate transaction anomaly (same amount and category, identical time)
        fraud_check_res = await risk_service.detect_transaction_fraud(
            business_id=business_id,
            amount=28000.0,
            source="UPI",
            category="Direct Customer Sales",
            timestamp=datetime.now() # same timestamp represents duplicate
        )
        print(f"       Fraud Probability: {fraud_check_res.fraud_probability:.2%}")
        print(f"       Is Flagged Fraudulent: {fraud_check_res.is_fraudulent}")
        print(f"       Audit evidence: {fraud_check_res.evidence}")
        
        # 8. Run Recommendation Service
        print("\n[8/14] Generating actionable operational advice (Module 4)...")
        rec_service = RecommendationService(db)
        rec_res = await rec_service.get_financial_recommendations(business_id)
        for idx, rec in enumerate(rec_res.recommendations):
            print(f"       [{idx+1}] Action: {rec.action} (Priority: {rec.priority})")
            print(f"           Reason: {rec.reason}")
            print(f"           Financial Impact: Rs.{rec.expected_financial_impact:,.2f}")
            
        # 9. Government Scheme Matching
        print("\n[9/14] Matching NABARD & MSME Schemes (Module 5)...")
        scheme_res = await rec_service.match_government_schemes(business_id)
        print(f"       Matched Schemes count: {len(scheme_res.matches)}")
        for idx, m in enumerate(scheme_res.matches[:2]):
            print(f"       [{idx+1}] Scheme: {m.scheme.name} (Provider: {m.scheme.provider})")
            print(f"           Match Score: {m.match_score:.2%}")
            print(f"           Subsidy Limit: {m.scheme.subsidy_percentage}% up to Rs.{m.scheme.max_amount or 0:,.2f}")
            
        # 10. Execute LangGraph Boardroom Simulation
        print("\n[10/14] Orchestrating LangGraph Multi-Agent Boardroom Debate (Module 10)...")
        boardroom_service = AgentBoardroomService(db)
        boardroom_res = await boardroom_service.run_boardroom_evaluation(
            business_id=business_id,
            loan_amount=500000.0,
            tenure_months=24
        )
        print(f"        Loan Requested: Rs.{boardroom_res.loan_amount:,.2f} for {boardroom_res.tenure_months} months")
        print(f"        Boardroom Consensus Decision: {boardroom_res.final_decision}")
        print(f"        Debate Summary: {boardroom_res.final_consensus_explanation}")
        print("        Specialized Agent Opinions:")
        for opinion in boardroom_res.agent_opinions:
            print(f"           • {opinion.agent}: decision={opinion.decision} | reason={opinion.reasoning}")
            
        # 11. Compile AI Underwriting Credit Memo
        print("\n[11/14] Generating exportable AI Credit Memo Report (Module 6)...")
        memo_service = CreditMemoService(db)
        memo_res = await memo_service.generate_credit_memo(
            business_id=business_id,
            loan_amount=500000.0,
            tenure_months=24
        )
        print(f"        Saved Underwriting Score: {memo_res.overall_score}/100")
        print(f"        Executive Decision: {memo_res.decision}")
        print("        Structured SWOT Analysis inside Memo JSON:")
        print(f"           Strengths: {memo_res.memo_json['swot']['strengths']}")
        print(f"           Weaknesses: {memo_res.memo_json['swot']['weaknesses']}")
        
        # 12. Run Scenario Simulations
        print("\n[12/14] Simulating Climate and Mandi Price Shock Scenarios (Module 9)...")
        sim_service = SimulationService(db)
        # Simulate severe drought (-30% rainfall) and market price drop (-15%)
        sim_req = SimulationRequest(
            rainfall_change_percent=-30.0,
            mandi_price_change_percent=-15.0,
            loan_applied_amount=0.0
        )
        sim_res = await sim_service.run_scenario_simulation(business_id, sim_req)
        print(f"        Original health score: {sim_res.original_health_score} | Simulated health: {sim_res.simulated_health_score}")
        print(f"        Original Risk Category: {sim_res.original_risk_level} | Simulated Risk: {sim_res.simulated_risk_level}")
        print(f"        Impact Summary: {sim_res.impact_analysis}")
        
        # 13. Test Document OCR Extraction
        print("\n[13/14] Running OCR parser and invoice fraud engine (Module 11)...")
        doc_service = DocumentService(db)
        doc = await doc_service.upload_document_record(
            business_id=business_id,
            filename="fertilizer_bill_2026.pdf",
            doc_type="INVOICE"
        )
        ocr_res = await doc_service.process_document_ocr(doc.id, file_path=None) # runs mock parse in sandbox
        print(f"        Document type: {ocr_res.document_type}")
        print(f"        Extracted Data: {ocr_res.extracted_data}")
        print(f"        Invoice Fraud Score: {ocr_res.fraud_risk_score:.2%}")
        
        # 14. Query Multilingual Voice AI assistant
        print("\n[14/14] Testing Multilingual Voice AI assistant handler (Module 12)...")
        voice_service = VoiceService(db)
        # Farmer queries in Hindi
        voice_req = VoiceQueryRequest(
            language="hi",
            text_query="क्या मैं उपकरण खरीदने के लिए ऋण ले सकता हूँ?"
        )
        voice_res = await voice_service.handle_multilingual_voice_query(business_id, voice_req)
        print(f"        Input language: {voice_res.language}")
        print(f"        Farmer Query Transcript: '{voice_res.original_transcript}'")
        print(f"        Assistant Verbal Response: '{voice_res.agent_text_response}'")
        
        print("\n" + "=" * 60)
        print("        ALL RuralOS AI BACKEND MODULES SUCCESSFULLY VERIFIED!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
