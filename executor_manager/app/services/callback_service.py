import asyncio
import logging
from datetime import datetime, timezone

from app.schemas.callback import AgentCallbackRequest, CallbackReceiveResponse
from app.services.backend_client import BackendClient
from app.services.workspace_export_service import WorkspaceExportService

logger = logging.getLogger(__name__)


backend_client = BackendClient()
workspace_export_service = WorkspaceExportService()


class CallbackService:
    """Service layer for callback processing."""

    async def process_callback(
        self, callback: AgentCallbackRequest
    ) -> CallbackReceiveResponse:
        """Process agent execution callback from executor.

        Args:
            callback: Callback data from executor

        Returns:
            CallbackReceiveResponse with acknowledgment

        Raises:
            AppException: If callback forwarding to backend fails
        """
        from app.core.errors.error_codes import ErrorCode
        from app.core.errors.exceptions import AppException

        # Log callback summary
        logger.info(
            f"Callback received - Session: {callback.session_id}, "
            f"Status: {callback.status}, Progress: {callback.progress}%"
        )

        if callback.state_patch:
            state = callback.state_patch
            todo_count = len(state.todos) if state.todos else 0
            mcp_count = len(state.mcp_status) if state.mcp_status else 0
            file_count = (
                len(state.workspace_state.file_changes) if state.workspace_state else 0
            )
            logger.info(
                f"State patch: {todo_count} todos, {mcp_count} MCP servers, {file_count} file changes"
            )

        try:
            payload_model = callback
            if callback.status in ["completed", "failed"]:
                payload_model = callback.model_copy(
                    update={"workspace_export_status": "pending"}
                )
            payload = payload_model.model_dump(mode="json")

            # Forward callback to backend
            await backend_client.forward_callback(payload)

            if callback.status in ["completed", "failed"]:
                from app.scheduler.task_dispatcher import TaskDispatcher

                logger.info(
                    f"Task {callback.status}, cleaning up container for session {callback.session_id}"
                )
                asyncio.create_task(self._export_and_forward(callback))
                await TaskDispatcher.on_task_complete(callback.session_id)

            return CallbackReceiveResponse(
                status="received",
                session_id=callback.session_id,
                callback_status=callback.status,
                progress=callback.progress,
            )

        except Exception as e:
            logger.error(f"Failed to forward callback: {e}")
            raise AppException(
                error_code=ErrorCode.CALLBACK_FORWARD_FAILED,
                message=f"Failed to forward callback to backend: {e}",
            )

    async def _export_and_forward(self, callback: AgentCallbackRequest) -> None:
        try:
            result = await asyncio.to_thread(
                workspace_export_service.export_workspace, callback.session_id
            )
        except Exception as exc:
            logger.error(f"Workspace export failed for {callback.session_id}: {exc}")
            result = None

        payload_model = AgentCallbackRequest(
            session_id=callback.session_id,
            time=datetime.now(timezone.utc),
            status=callback.status,
            progress=100 if callback.status == "completed" else callback.progress,
            sdk_session_id=callback.sdk_session_id,
            workspace_files_prefix=result.workspace_files_prefix if result else None,
            workspace_manifest_key=result.workspace_manifest_key if result else None,
            workspace_archive_key=result.workspace_archive_key if result else None,
            workspace_export_status=(
                result.workspace_export_status if result else "failed"
            ),
        )
        payload = payload_model.model_dump(mode="json")

        try:
            await backend_client.forward_callback(payload)
        except Exception as exc:
            logger.error(
                f"Failed to forward workspace export callback for {callback.session_id}: {exc}"
            )
