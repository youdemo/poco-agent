import logging
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.core.errors.error_codes import ErrorCode
from app.core.errors.exceptions import AppException
from app.core.settings import get_settings

logger = logging.getLogger(__name__)


class S3StorageService:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.s3_bucket:
            raise AppException(
                error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                message="S3 bucket is not configured",
            )
        if not settings.s3_endpoint:
            raise AppException(
                error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                message="S3 endpoint is not configured",
            )
        if not settings.s3_access_key or not settings.s3_secret_key:
            raise AppException(
                error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                message="S3 credentials are not configured",
            )

        self.bucket = settings.s3_bucket

        config_kwargs: dict[str, Any] = {}
        if settings.s3_force_path_style:
            config_kwargs["s3"] = {"addressing_style": "path"}
        config = Config(**config_kwargs) if config_kwargs else None

        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name=settings.s3_region,
            config=config,
        )

    def upload_file(
        self, *, file_path: str, key: str, content_type: str | None = None
    ) -> None:
        extra_args: dict[str, Any] = {}
        if content_type:
            extra_args["ContentType"] = content_type
        try:
            if extra_args:
                self.client.upload_file(
                    file_path, self.bucket, key, ExtraArgs=extra_args
                )
            else:
                self.client.upload_file(file_path, self.bucket, key)
        except (ClientError, BotoCoreError) as exc:
            logger.error(f"Failed to upload {file_path} to {key}: {exc}")
            raise AppException(
                error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                message="Failed to upload workspace file",
                details={"key": key, "file_path": file_path, "error": str(exc)},
            ) from exc

    def put_object(
        self,
        *,
        key: str,
        body: bytes,
        content_type: str | None = None,
    ) -> None:
        kwargs: dict[str, Any] = {"Bucket": self.bucket, "Key": key, "Body": body}
        if content_type:
            kwargs["ContentType"] = content_type
        try:
            self.client.put_object(**kwargs)
        except (ClientError, BotoCoreError) as exc:
            logger.error(f"Failed to put object {key}: {exc}")
            raise AppException(
                error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
                message="Failed to upload workspace manifest",
                details={"key": key, "error": str(exc)},
            ) from exc
