from celery import Celery
from app.config import settings

# Initialize Celery app
celery_worker = Celery(
    "ruralos_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"]
)

# Optional configurations
celery_worker.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300, # 5 minutes maximum runtime
)
