from typing import Generator

from fastapi import Header
from sqlalchemy.orm import Session

from app.core.database import SessionLocal

DEFAULT_USER_ID = "default"


def get_current_user_id(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
) -> str:
    """FastAPI dependency for the current user id.

    NOTE: Auth is not implemented yet. For now we allow callers to pass X-User-Id
    and fall back to DEFAULT_USER_ID when absent.
    """
    value = (x_user_id or "").strip()
    return value or DEFAULT_USER_ID


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
