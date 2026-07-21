# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.v1.api import api_router
from app.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Database Table Creation
    # This automatically registers all schemas/tables in PostgreSQL on startup
    async with engine.begin() as conn:
        # For demo purposes, we automatically build tables if they do not exist
        await conn.run_sync(Base.metadata.create_all)
    
    # Automatic Seeding of Ramesh Kumar, Sunita Devi, and Vignesh Rao profiles
    from app.database import AsyncSessionLocal
    from app.models import Business, DigitalTwin, Transaction
    from sqlalchemy.future import select
    import uuid
    from datetime import datetime, timedelta

    async with AsyncSessionLocal() as session:
        ramesh_id = uuid.UUID('00000000-0000-0000-0000-000000000001')
        stmt = select(Business).filter(Business.id == ramesh_id)
        res = await session.execute(stmt)
        if not res.scalars().first():
            print("Seeding default business profiles (Ramesh, Sunita, Vignesh) for frontend demo...")
            
            # 1. Ramesh Kumar (Dairy)
            ramesh = Business(
                id=ramesh_id,
                name="Ramesh Kumar",
                sector="Dairy & Husbandry",
                sub_sector="Dairy Farming",
                latitude=18.5204,
                longitude=73.8567,
                district="Pune",
                state="Maharashtra"
            )
            session.add(ramesh)
            
            ramesh_twin = DigitalTwin(
                business_id=ramesh_id,
                assets_valuation=2450000.0,
                outstanding_loans=470000.0,
                inventory_value=120000.0,
                supplier_count=2,
                customer_count=45,
                supplier_stability_score=0.88
            )
            session.add(ramesh_twin)

            base_time = datetime.now() - timedelta(days=45)
            # Inflows (Milk cooperative sales)
            for i in range(1, 10):
                tx = Transaction(
                    business_id=ramesh_id,
                    amount=20000.0 * i,
                    transaction_type="INFLOW",
                    source="Bank",
                    category="Cooperative Milk Sales",
                    timestamp=base_time + timedelta(days=4 * i)
                )
                session.add(tx)
            # Outflows (Feed cost, labor)
            for i in range(1, 10):
                tx = Transaction(
                    business_id=ramesh_id,
                    amount=12000.0 * i,
                    transaction_type="OUTFLOW",
                    source="UPI",
                    category="Cattle Feed",
                    timestamp=base_time + timedelta(days=4 * i + 1)
                )
                session.add(tx)

            # 2. Sunita Devi (Wheat)
            sunita_id = uuid.UUID('00000000-0000-0000-0000-000000000002')
            sunita = Business(
                id=sunita_id,
                name="Sunita Devi",
                sector="Agriculture",
                sub_sector="Wheat Cultivation",
                latitude=26.9124,
                longitude=75.7873,
                district="Churu",
                state="Rajasthan"
            )
            session.add(sunita)
            
            sunita_twin = DigitalTwin(
                business_id=sunita_id,
                assets_valuation=1200000.0,
                outstanding_loans=150000.0,
                inventory_value=90000.0,
                supplier_count=3,
                customer_count=12,
                supplier_stability_score=0.72
            )
            session.add(sunita_twin)

            for i in range(1, 6):
                tx = Transaction(
                    business_id=sunita_id,
                    amount=35000.0 * i,
                    transaction_type="INFLOW",
                    source="UPI",
                    category="Mandi Crop Sales",
                    timestamp=base_time + timedelta(days=7 * i)
                )
                session.add(tx)
                tx_out = Transaction(
                    business_id=sunita_id,
                    amount=15000.0 * i,
                    transaction_type="OUTFLOW",
                    source="Cash",
                    category="Fertilizer Seeds",
                    timestamp=base_time + timedelta(days=7 * i + 2)
                )
                session.add(tx_out)

            # 3. Vignesh Rao (Handloom)
            vignesh_id = uuid.UUID('00000000-0000-0000-0000-000000000003')
            vignesh = Business(
                id=vignesh_id,
                name="Vignesh Rao",
                sector="Handloom & MSME",
                sub_sector="Solar Weaving Unit",
                latitude=12.9716,
                longitude=77.5946,
                district="Chikka",
                state="Karnataka"
            )
            session.add(vignesh)
            
            vignesh_twin = DigitalTwin(
                business_id=vignesh_id,
                assets_valuation=3800000.0,
                outstanding_loans=0.0,
                inventory_value=450000.0,
                supplier_count=8,
                customer_count=180,
                supplier_stability_score=0.96
            )
            session.add(vignesh_twin)

            for i in range(1, 12):
                tx = Transaction(
                    business_id=vignesh_id,
                    amount=48000.0 * i,
                    transaction_type="INFLOW",
                    source="Bank",
                    category="Textile Export B2B",
                    timestamp=base_time + timedelta(days=3 * i)
                )
                session.add(tx)
                tx_out = Transaction(
                    business_id=vignesh_id,
                    amount=22000.0 * i,
                    transaction_type="OUTFLOW",
                    source="UPI",
                    category="Yarn Logistics",
                    timestamp=base_time + timedelta(days=3 * i + 1)
                )
                session.add(tx_out)

            await session.commit()
            print("Successfully seeded database with Ramesh, Sunita, and Vignesh profiles.")
    
    yield
    # Shutdown actions if any
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The AI Operating System for Rural Finance (NABARD Hackathon)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to trusted domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register main API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database_connected": True
    }
