import secrets
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "E-commerce AI Platform"
    debug: bool = False
    api_prefix: str = "/api"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ecommerce_ai"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = secrets.token_urlsafe(32)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Admin - MUST be set via environment variable, no default
    admin_password: Optional[str] = None

    # Qwen API
    qwen_api_key: Optional[str] = None
    qwen_model: str = "qwen3.5plus"
    qwen_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Server
    server_host: str = "localhost"
    server_port: int = 8004

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "allow"

    @property
    def admin_password(self) -> str:
        """Get admin password from environment or settings, raise error if not set"""
        password = os.environ.get("ADMIN_PASSWORD") or self.admin_password
        if not password:
            raise RuntimeError(
                "ADMIN_PASSWORD environment variable is not set. "
                "Please set it before starting the server in production mode."
            )
        return password


settings = Settings()