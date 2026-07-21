from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
import uuid
from app.models import Business, DigitalTwin
from app.repositories.base import BaseRepository

class BusinessRepository(BaseRepository[Business]):
    def __init__(self, db: AsyncSession):
        super().__init__(Business, db)

    async def get_with_twin(self, business_id: uuid.UUID) -> Optional[Business]:
        stmt = (
            select(Business)
            .options(selectinload(Business.digital_twin))
            .filter(Business.id == business_id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_name(self, name: str) -> List[Business]:
        stmt = select(Business).filter(Business.name.ilike(f"%{name}%"))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def ensure_twin(self, business_id: uuid.UUID) -> DigitalTwin:
        # Fetch or initialize a digital twin state
        stmt = select(DigitalTwin).filter(DigitalTwin.business_id == business_id)
        res = await self.db.execute(stmt)
        twin = res.scalars().first()
        if not twin:
            twin = DigitalTwin(
                business_id=business_id,
                assets_valuation=500000.0,  # default estimates for rural SME
                outstanding_loans=0.0,
                inventory_value=120000.0,
                supplier_count=4,
                customer_count=45,
                supplier_stability_score=0.85
            )
            self.db.add(twin)
            await self.db.flush()
        return twin
