import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.repositories.business_repo import BusinessRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.schemas import BusinessCreate, BusinessResponse, TransactionCreate, TransactionResponse, DigitalTwinResponse
from app.services.twin_service import TwinService

router = APIRouter()

@router.post("/", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
async def create_business(business_in: BusinessCreate, db: AsyncSession = Depends(get_db)):
    repo = BusinessRepository(db)
    # Check if business with same name exists
    existing = await repo.get_by_name(business_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="Business with this name already registered.")
    
    db_business = await repo.create(business_in.model_dump())
    # Automatically initialize their digital twin state
    await repo.ensure_twin(db_business.id)
    return db_business

@router.get("/", response_model=List[BusinessResponse])
async def list_businesses(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    repo = BusinessRepository(db)
    return await repo.get_multi(skip=skip, limit=limit)

@router.get("/{business_id}", response_model=BusinessResponse)
async def get_business(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = BusinessRepository(db)
    business = await repo.get(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

# --- Digital Twin Sync ---
@router.get("/{business_id}/twin", response_model=DigitalTwinResponse)
async def get_digital_twin(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    twin_service = TwinService(db)
    try:
        return await twin_service.get_twin(business_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Transactions Posting ---
@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(tx_in: TransactionCreate, db: AsyncSession = Depends(get_db)):
    tx_repo = TransactionRepository(db)
    
    # Assess if transaction is anomalous/fraudulent in background
    # Standard insertion
    db_tx = await tx_repo.create(tx_in.model_dump())
    
    # Perform a light check to flag anomaly flag
    from app.services.risk_service import RiskService
    risk_service = RiskService(db)
    fraud_check = await risk_service.detect_transaction_fraud(
        business_id=tx_in.business_id,
        amount=tx_in.amount,
        source=tx_in.source,
        category=tx_in.category,
        timestamp=tx_in.timestamp
    )
    if fraud_check.is_fraudulent:
        db_tx.is_anomaly = True
        db.add(db_tx)
        
    return db_tx

@router.get("/{business_id}/transactions", response_model=List[TransactionResponse])
async def get_business_transactions(business_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    tx_repo = TransactionRepository(db)
    return await tx_repo.get_by_business(business_id)
