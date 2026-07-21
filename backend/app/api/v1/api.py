from fastapi import APIRouter
from app.api.v1.endpoints import business, analytics

api_router = APIRouter()

# Include subrouters
api_router.include_router(business.router, prefix="/business", tags=["Business Profiles"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["RuralOS AI Engines"])
