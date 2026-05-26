import secrets
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List


class Settings(BaseSettings):
    # App
    app_name: str = "E-commerce AI Platform"
    debug: bool = False
    api_prefix: str = "/api"

    # Database - empty string or not set means disabled
    @property
    def database_url(self) -> Optional[str]:
        val = os.environ.get("DATABASE_URL", "")
        return val if val else None

    # Redis - empty string or not set means disabled
    @property
    def redis_url(self) -> Optional[str]:
        val = os.environ.get("REDIS_URL", "")
        return val if val else None

    # JWT
    jwt_secret_key: str = secrets.token_urlsafe(32)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Qwen API
    qwen_api_key: Optional[str] = None
    qwen_model: str = "qwen3.5plus"
    qwen_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Server
    server_host: str = "localhost"
    server_port: int = 8004

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow",
    )

    @property
    def admin_password(self) -> str:
        """Get admin password from environment, raise error if not set"""
        password = os.environ.get("ADMIN_PASSWORD")
        if not password:
            raise RuntimeError(
                "ADMIN_PASSWORD environment variable is not set. "
                "Please set it before starting the server in production mode."
            )
        return password


settings = Settings()