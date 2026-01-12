import httpx

from app.core.settings import get_settings


class ExecutorClient:
    """Client for calling the Executor service."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.executor_url = self.settings.executor_url

    async def execute_task(
        self,
        session_id: str,
        prompt: str,
        callback_url: str,
        callback_token: str,
        config: dict,
    ) -> str:
        """Call Executor to execute a task."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.executor_url}/v1/tasks/execute",
                json={
                    "session_id": session_id,
                    "prompt": prompt,
                    "callback_url": callback_url,
                    "callback_token": callback_token,
                    "config": config,
                },
                timeout=300.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["session_id"]
