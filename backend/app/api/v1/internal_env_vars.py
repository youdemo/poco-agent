from fastapi import APIRouter, Depends, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_id, get_db
from app.core.errors.error_codes import ErrorCode
from app.core.errors.exceptions import AppException
from app.core.settings import get_settings
from app.schemas.env_var import (
    SystemEnvVarCreateRequest,
    SystemEnvVarResponse,
    SystemEnvVarUpdateRequest,
)
from app.schemas.response import Response, ResponseSchema
from app.services.env_var_service import EnvVarService

router = APIRouter(prefix="/internal", tags=["internal"])

env_var_service = EnvVarService()


def require_internal_token(
    x_internal_token: str | None = Header(default=None, alias="X-Internal-Token"),
) -> None:
    settings = get_settings()
    if not settings.internal_api_token:
        raise AppException(
            error_code=ErrorCode.FORBIDDEN,
            message="Internal API token is not configured",
        )
    if not x_internal_token or x_internal_token != settings.internal_api_token:
        raise AppException(
            error_code=ErrorCode.FORBIDDEN,
            message="Invalid internal token",
        )


@router.get("/env-vars/map", response_model=ResponseSchema[dict[str, str]])
async def get_env_map(
    _: None = Depends(require_internal_token),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> JSONResponse:
    env_map = env_var_service.get_env_map(db, user_id=user_id)
    return Response.success(data=env_map, message="Env map retrieved")


@router.get(
    "/system-env-vars",
    response_model=ResponseSchema[list[SystemEnvVarResponse]],
)
async def list_system_env_vars(
    _: None = Depends(require_internal_token),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = env_var_service.list_system_env_vars(db)
    return Response.success(data=result, message="System env vars retrieved")


@router.post(
    "/system-env-vars",
    response_model=ResponseSchema[SystemEnvVarResponse],
)
async def create_system_env_var(
    request: SystemEnvVarCreateRequest,
    _: None = Depends(require_internal_token),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = env_var_service.create_system_env_var(db, request)
    return Response.success(data=result, message="System env var created")


@router.patch(
    "/system-env-vars/{env_var_id}",
    response_model=ResponseSchema[SystemEnvVarResponse],
)
async def update_system_env_var(
    env_var_id: int,
    request: SystemEnvVarUpdateRequest,
    _: None = Depends(require_internal_token),
    db: Session = Depends(get_db),
) -> JSONResponse:
    result = env_var_service.update_system_env_var(db, env_var_id, request)
    return Response.success(data=result, message="System env var updated")


@router.delete(
    "/system-env-vars/{env_var_id}",
    response_model=ResponseSchema[dict],
)
async def delete_system_env_var(
    env_var_id: int,
    _: None = Depends(require_internal_token),
    db: Session = Depends(get_db),
) -> JSONResponse:
    env_var_service.delete_system_env_var(db, env_var_id)
    return Response.success(data={"id": env_var_id}, message="System env var deleted")
