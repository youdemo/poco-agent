import logging
import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.repositories.usage_log_repository import UsageLogRepository
from app.schemas.usage import UsageResponse

logger = logging.getLogger(__name__)


class UsageService:
    """Service layer for usage statistics."""

    def get_usage_summary(self, db: Session, session_id: uuid.UUID) -> UsageResponse:
        """Gets aggregated usage statistics for a session.

        Args:
            db: Database session
            session_id: Session ID

        Returns:
            Aggregated usage statistics
        """
        logs = UsageLogRepository.list_by_session(db, session_id)

        if not logs:
            return UsageResponse(
                total_cost_usd=None,
                total_duration_ms=None,
                usage_json=None,
            )

        # Aggregate scalar fields
        total_cost_usd = 0.0
        total_duration_ms = 0

        # Aggregate usage_json fields
        aggregated_usage: dict[str, Any] = {}

        for log in logs:
            if log.total_cost_usd is not None:
                total_cost_usd += float(log.total_cost_usd)
            if log.duration_ms is not None:
                total_duration_ms += log.duration_ms

            # Merge usage_json fields
            if log.usage_json:
                for key, value in log.usage_json.items():
                    if isinstance(value, int | float):
                        aggregated_usage[key] = aggregated_usage.get(key, 0) + value
                    else:
                        # For non-numeric fields, keep the last value
                        aggregated_usage[key] = value

        logger.debug(
            f"Retrieved usage summary for session {session_id}: "
            f"cost=${total_cost_usd:.6f}, "
            f"duration={total_duration_ms}ms"
        )

        return UsageResponse(
            total_cost_usd=total_cost_usd,
            total_duration_ms=total_duration_ms,
            usage_json=aggregated_usage if aggregated_usage else None,
        )
