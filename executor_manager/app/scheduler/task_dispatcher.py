import logging

from app.core.settings import get_settings
from app.services.backend_client import BackendClient
from app.services.executor_client import ExecutorClient

logger = logging.getLogger(__name__)


class TaskDispatcher:
    """Task dispatcher - task functions called by APScheduler."""

    @staticmethod
    async def dispatch(
        task_id: str, session_id: str, prompt: str, config: dict
    ) -> None:
        """Dispatch task to Executor."""
        settings = get_settings()
        executor_client = ExecutorClient()
        backend_client = BackendClient()

        # Construct callback URL (pointing to Executor Manager's callback endpoint)
        callback_url = f"{settings.callback_base_url}/api/v1/callback"
        callback_token = settings.callback_token

        try:
            logger.info(
                f"Dispatching task {task_id} (session: {session_id}) to executor"
            )

            # Update session status to running
            await backend_client.update_session_status(session_id, "running")

            # Call Executor to execute task
            await executor_client.execute_task(
                session_id=session_id,
                prompt=prompt,
                callback_url=callback_url,
                callback_token=callback_token,
                config=config,
            )

            logger.info(f"Task {task_id} dispatched successfully to executor")

        except Exception as e:
            logger.error(f"Failed to dispatch task {task_id}: {e}")
            await backend_client.update_session_status(session_id, "failed")
            raise
