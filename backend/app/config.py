from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "RuralOS AI Backend"
    ENVIRONMENT: str = "development"
    
    # Database Settings
    # default local fallback URL
    DATABASE_URL: str = "sqlite+aiosqlite:///../ruralos.db"

    
    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # LLM Settings (for LangGraph / Credit Memo / Voice AI)
    # Using dummy keys if none provided, allowing mock fallbacks in services
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o-mini"
    
    # Model storage directory (for cash flow, risk, fraud models)
    MODEL_DIR: str = "./ml_models"
    
    # OCR and Document storage
    UPLOAD_DIR: str = "./uploads"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
