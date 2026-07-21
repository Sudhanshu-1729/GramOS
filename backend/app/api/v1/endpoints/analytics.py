import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional

from app.database import get_db
from app.schemas.schemas import (
    ForecastResponse, RiskAssessmentResponse, RecommendationResponse,
    SchemeMatchResponse, CreditMemoResponse, SimulationRequest, SimulationResponse,
    BoardroomRequest, BoardroomResponse, DocumentUploadResponse, DocumentOCRResponse,
    VoiceQueryRequest, VoiceQueryResponse
)
from app.services.forecasting_service import ForecastingService
from app.services.risk_service import RiskService
from app.services.recommendation_service import RecommendationService
from app.services.simulation_service import SimulationService
from app.services.agent_boardroom_service import AgentBoardroomService
from app.services.document_service import DocumentService
from app.services.voice_service import VoiceService
from app.services.credit_memo_service import CreditMemoService

router = APIRouter()

# --- Module 1: Cash Flow Forecast ---
@router.post("/forecast/{business_id}", response_model=ForecastResponse)
async def get_forecast(business_id: uuid.UUID, horizon_days: int = 30, db: AsyncSession = Depends(get_db)):
    service = ForecastingService(db)
    try:
        return await service.generate_cash_flow_forecast(business_id, horizon_days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Module 2: Risk Assessment ---
@router.post("/risk/{business_id}", response_model=RiskAssessmentResponse)
async def evaluate_risk(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = RiskService(db)
    try:
        return await service.evaluate_risk(business_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Module 4: Recommendations & Module 5: Schemes ---
@router.get("/recommendations/{business_id}", response_model=RecommendationResponse)
async def get_recommendations(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = RecommendationService(db)
    try:
        return await service.get_financial_recommendations(business_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/schemes/{business_id}", response_model=SchemeMatchResponse)
async def get_scheme_matches(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = RecommendationService(db)
    try:
        return await service.match_government_schemes(business_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Module 9: Scenario Simulation ---
@router.post("/simulation/{business_id}", response_model=SimulationResponse)
async def simulate_scenario(business_id: uuid.UUID, req: SimulationRequest, db: AsyncSession = Depends(get_db)):
    service = SimulationService(db)
    try:
        return await service.run_scenario_simulation(business_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Module 10: Multi-Agent Boardroom ---
@router.post("/boardroom/{business_id}", response_model=BoardroomResponse)
async def run_boardroom(business_id: uuid.UUID, req: BoardroomRequest, db: AsyncSession = Depends(get_db)):
    service = AgentBoardroomService(db)
    try:
        boardroom_resp = await service.run_boardroom_evaluation(
            business_id=business_id,
            loan_amount=req.loan_amount,
            tenure_months=req.tenure_months,
            interest_rate=req.interest_rate
        )
        
        # If boardroom decision is APPROVE or REFER, generate Credit Memo automatically (Module 6)
        if boardroom_resp.final_decision in ["APPROVE", "REFER"]:
            memo_service = CreditMemoService(db)
            memo = await memo_service.generate_credit_memo(
                business_id=business_id,
                loan_amount=req.loan_amount,
                tenure_months=req.tenure_months,
                interest_rate=req.interest_rate
            )
            boardroom_resp.credit_memo_id = memo.id
            
        return boardroom_resp
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Module 6: Credit Memo retrieval ---
@router.get("/credit-memo/{business_id}", response_model=Optional[CreditMemoResponse])
async def get_latest_credit_memo(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.future import select
    from app.models import CreditMemo
    stmt = select(CreditMemo).filter(CreditMemo.business_id == business_id).order_by(CreditMemo.created_at.desc())
    result = await db.execute(stmt)
    memo = result.scalars().first()
    if not memo:
        raise HTTPException(status_code=404, detail="No Credit Memo found for this business. Run boardroom evaluation first.")
    return CreditMemoResponse.model_validate(memo)

# --- Module 11: Document Intelligence (OCR Upload & Parse) ---
@router.post("/documents/upload/{business_id}", response_model=DocumentOCRResponse)
async def upload_document(
    business_id: uuid.UUID,
    document_type: str = Form(..., description="INVOICE or BANK_STATEMENT"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    service = DocumentService(db)
    # Save file record
    doc = await service.upload_document_record(
        business_id=business_id,
        filename=file.filename,
        doc_type=document_type
    )

    # Save to local file storage for processing
    import os
    from app.config import settings
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{doc.id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Execute OCR processing synchronously for rapid API testing
    try:
        return await service.process_document_ocr(doc.id, file_path)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Module 12: Voice AI Assistant ---
@router.post("/voice/{business_id}", response_model=VoiceQueryResponse)
async def query_voice(business_id: uuid.UUID, req: VoiceQueryRequest, db: AsyncSession = Depends(get_db)):
    service = VoiceService(db)
    try:
        return await service.handle_multilingual_voice_query(business_id, req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
