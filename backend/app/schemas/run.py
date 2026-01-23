from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class RunStatus(str, Enum):
    """Run status enum."""

    QUEUED = "queued"
    CLAIMED = "claimed"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"


class RunResponse(BaseModel):
    """Run response."""

    run_id: UUID = Field(validation_alias="id")
    session_id: UUID
    user_message_id: int
    status: str
    progress: int
    schedule_mode: str
    scheduled_at: datetime
    config_snapshot: dict | None = None
    claimed_by: str | None
    lease_expires_at: datetime | None
    attempts: int
    last_error: str | None
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @field_serializer("config_snapshot")
    def _serialize_config_snapshot(self, value: dict | None) -> dict | None:
        # Backward-compat + security: never expose full MCP configs to callers.
        if not isinstance(value, dict):
            return value
        sanitized = dict(value)
        sanitized.pop("mcp_config", None)
        return sanitized

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class RunClaimRequest(BaseModel):
    """Claim next run request."""

    worker_id: str
    lease_seconds: int = 30
    schedule_modes: list[str] | None = None


class RunClaimResponse(BaseModel):
    """Claim next run response for worker dispatch."""

    run: RunResponse
    user_id: str
    prompt: str
    config_snapshot: dict | None = None
    sdk_session_id: str | None = None


class RunStartRequest(BaseModel):
    """Mark run as running request."""

    worker_id: str


class RunFailRequest(BaseModel):
    """Mark run as failed request."""

    worker_id: str
    error_message: str | None = None
