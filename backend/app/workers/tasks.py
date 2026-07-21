import asyncio
import uuid
from typing import Dict, Any
from app.workers.celery_app import celery_worker
from app.database import AsyncSessionLocal
from app.services.document_service import DocumentService
from app.services.agent_boardroom_service import AgentBoardroomService
from app.services.risk_service import RiskService
from app.services.forecasting_service import ForecastingService

def run_async(coro):
    """Utility to run asynchronous tasks within synchronous Celery worker threads."""
    return asyncio.get_event_loop().run_until_complete(coro)

@celery_worker.task(name="tasks.process_document_ocr")
def process_document_ocr(document_id_str: str, file_path: str):
    """Asynchronously processes OCR and anomaly auditing on invoices/bank statements."""
    document_id = uuid.UUID(document_id_str)
    
    async def run():
        async with AsyncSessionLocal() as db:
            service = DocumentService(db)
            result = await service.process_document_ocr(document_id, file_path)
            await db.commit()
            return result.model_dump()
            
    return run_async(run())


@celery_worker.task(name="tasks.run_boardroom_negotiation")
def run_boardroom_negotiation(business_id_str: str, loan_amount: float, tenure_months: int):
    """Triggers LangGraph boardroom agent debate in the background."""
    business_id = uuid.UUID(business_id_str)
    
    async def run():
        async with AsyncSessionLocal() as db:
            service = AgentBoardroomService(db)
            result = await service.run_boardroom_evaluation(
                business_id=business_id,
                loan_amount=loan_amount,
                tenure_months=tenure_months
            )
            await db.commit()
            return result.model_dump()
            
    return run_async(run())


@celery_worker.task(name="tasks.retrain_business_models")
def retrain_business_models(business_id_str: str):
    """Triggers model training of forecasting and risk models using updated transactions."""
    business_id = uuid.UUID(business_id_str)
    
    async def run():
        async with AsyncSessionLocal() as db:
            # Re-evaluate risk to trigger feature generation and local model fit
            risk_service = RiskService(db)
            forecast_service = ForecastingService(db)
            
            await risk_service.evaluate_risk(business_id)
            await forecast_service.generate_cash_flow_forecast(business_id, horizon_days=30)
            
            await db.commit()
            return {"status": "retraining_completed", "business_id": business_id_str}
            
    return run_async(run())
