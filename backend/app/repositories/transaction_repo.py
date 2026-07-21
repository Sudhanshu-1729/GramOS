from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Dict, Any
import uuid
from datetime import datetime
from app.models import Transaction
from app.repositories.base import BaseRepository

class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: AsyncSession):
        super().__init__(Transaction, db)

    async def get_by_business(self, business_id: uuid.UUID, limit: int = 1000) -> List[Transaction]:
        stmt = (
            select(Transaction)
            .filter(Transaction.business_id == business_id)
            .order_by(Transaction.timestamp.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_stats_by_type(self, business_id: uuid.UUID) -> Dict[str, float]:
        # Return summary inflow/outflow totals
        stmt = (
            select(
                Transaction.transaction_type,
                func.sum(Transaction.amount).label("total")
            )
            .filter(Transaction.business_id == business_id)
            .group_by(Transaction.transaction_type)
        )
        result = await self.db.execute(stmt)
        stats = {"INFLOW": 0.0, "OUTFLOW": 0.0}
        for row in result.all():
            stats[row[0]] = float(row[1] or 0.0)
        return stats

    async def get_category_breakdown(self, business_id: uuid.UUID) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Transaction.category,
                Transaction.transaction_type,
                func.sum(Transaction.amount).label("total"),
                func.count(Transaction.id).label("count")
            )
            .filter(Transaction.business_id == business_id)
            .group_by(Transaction.category, Transaction.transaction_type)
        )
        result = await self.db.execute(stmt)
        return [
            {
                "category": row[0],
                "transaction_type": row[1],
                "total": float(row[2] or 0.0),
                "count": row[3]
            }
            for row in result.all()
        ]
