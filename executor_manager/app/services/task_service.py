import logging
import uuid

import httpx

from app.core.errors.error_codes import ErrorCode
from app.core.errors.exceptions import AppException
from app.core.settings import get_settings
from app.scheduler.scheduler_config import scheduler
from app.scheduler.task_dispatcher import TaskDispatcher
from app.schemas.task import (
    SessionStatusResponse,
    TaskCreateResponse,
    TaskStatusResponse,
)

logger = logging.getLogger(__name__)


class TaskService:
    """Service layer for task operations."""

    def __init__(self) -> None:
        self.settings = get_settings()

    async def create_task(
        self,
        user_id: str,
        prompt: str,
        config: dict,
    ) -> TaskCreateResponse:
        """Create a task and schedule it for execution.

        Args:
            user_id: User ID who created the task
            prompt: Task prompt for the agent
            config: Task configuration dictionary

        Returns:
            TaskCreateResponse with task_id and session_id

        Raises:
            AppException: If session creation or task scheduling fails
        """
        from app.services.backend_client import BackendClient

        task_id = str(uuid.uuid4())

        try:
            # Create session via backend
            backend_client = BackendClient()
            session_id = await backend_client.create_session(
                user_id=user_id, config=config
            )

            logger.info(f"Created session {session_id} for task {task_id}")

            # Schedule task for immediate execution
            scheduler.add_job(
                TaskDispatcher.dispatch,
                args=[task_id, session_id, prompt, config],
                id=task_id,
                replace_existing=True,
            )

            logger.info(f"Task {task_id} scheduled for execution")

            return TaskCreateResponse(
                task_id=task_id, session_id=session_id, status="scheduled"
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to create session: {e}")
            raise AppException(
                error_code=ErrorCode.SESSION_CREATE_FAILED,
                message=f"Failed to create session: {e.response.text}",
            )
        except Exception as e:
            logger.error(f"Failed to create task: {e}")
            raise AppException(
                error_code=ErrorCode.TASK_SCHEDULING_FAILED,
                message=str(e),
            )

    def get_task_status(self, task_id: str) -> TaskStatusResponse:
        """Get task status from scheduler.

        Args:
            task_id: Task ID to query

        Returns:
            TaskStatusResponse with task status info

        Raises:
            AppException: If task not found in scheduler
        """
        job = scheduler.get_job(task_id)

        if job:
            return TaskStatusResponse(
                task_id=task_id,
                status="scheduled",
                next_run_time=str(job.next_run_time) if job.next_run_time else None,
            )

        # Task not found in scheduler - may have already executed
        raise AppException(
            error_code=ErrorCode.TASK_NOT_FOUND,
            message="Task not found in scheduler. It may have already been executed.",
            details={"task_id": task_id},
        )

    async def get_session_status(self, session_id: str) -> SessionStatusResponse:
        """Get session status from backend.

        Args:
            session_id: Session ID to query

        Returns:
            SessionStatusResponse from backend

        Raises:
            AppException: If session not found or backend request fails
        """
        from app.services.backend_client import BackendClient

        backend_client = BackendClient()

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{backend_client.settings.backend_url}/api/v1/sessions/{session_id}"
                )
                response.raise_for_status()
                data = response.json()

            # Parse backend response (backend returns wrapped ResponseSchema)
            session_data = data.get("data", data)
            return SessionStatusResponse(**session_data)

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise AppException(
                    error_code=ErrorCode.SESSION_NOT_FOUND,
                    message=f"Session not found: {session_id}",
                )
            raise AppException(
                error_code=ErrorCode.BACKEND_UNAVAILABLE,
                message=f"Backend request failed: {e.response.text}",
            )
        except Exception as e:
            logger.error(f"Failed to get session status: {e}")
            raise AppException(
                error_code=ErrorCode.BACKEND_UNAVAILABLE,
                message=str(e),
            )
