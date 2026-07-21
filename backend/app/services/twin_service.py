import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.business_repo import BusinessRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.schemas import DigitalTwinResponse

class TwinService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.business_repo = BusinessRepository(db)
        self.tx_repo = TransactionRepository(db)

    async def get_twin(self, business_id: uuid.UUID) -> DigitalTwinResponse:
        """
        Retrieves or initializes the stateful Digital Twin representation (Module 8).
        """
        business = await self.business_repo.get_with_twin(business_id)
        if not business:
            raise ValueError(f"Business not found: {business_id}")

        twin = await self.business_repo.ensure_twin(business_id)
        
        # Recalculate dynamic aggregates based on transaction data
        tx_stats = await self.tx_repo.get_stats_by_type(business_id)
        
        # Simple heuristic to update valuations and counters
        # Assets valuation increases with large net inflows
        net_worth = tx_stats.get("INFLOW", 0.0) - tx_stats.get("OUTFLOW", 0.0)
        
        # Update twin state in database
        twin.assets_valuation = float(twin.assets_valuation) + max(0.0, net_worth * 0.05)
        twin.last_sync = datetime.utcnow()
        self.db.add(twin)
        await self.db.flush()

        return DigitalTwinResponse.model_validate(twin)

    async def update_twin_state(self, business_id: uuid.UUID, updates: dict) -> DigitalTwinResponse:
        twin = await self.business_repo.ensure_twin(business_id)
        for key, val in updates.items():
            if hasattr(twin, key):
                setattr(twin, key, val)
        self.db.add(twin)
        await self.db.flush()
        return DigitalTwinResponse.model_validate(twin)
