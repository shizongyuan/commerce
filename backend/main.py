from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uuid
import os
import logging
from core.config import settings
from core.ai_client import qwen_client
from core.database import init_db, close_db
from core.cache import cache

# 配置日志
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化
    _ = qwen_client.client
    await cache.connect()
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"Database init warning: {e}")
    yield
    # 关闭时清理
    await cache.close()
    await qwen_client.close()
    await close_db()
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """为每个请求添加唯一ID"""
    import logging
    logger = logging.getLogger(__name__)
    request.state.request_id = str(uuid.uuid4())[:8]
    logger.debug(f"Request {request.state.request_id}: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.debug(f"Response {request.state.request_id}: {response.status_code}")
        response.headers["X-Request-ID"] = request.state.request_id
        return response
    except Exception as e:
        logger.error(f"Middleware exception for {request.state.request_id}: {e}", exc_info=True)
        raise


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 永远不暴露异常详情，即使在调试模式
    # 调试模式的详细信息应该只在日志中记录
    import logging
    logger = logging.getLogger(__name__)
    logger.error(
        f"Unhandled exception: {exc}",
        extra={
            "request_id": getattr(request.state, "request_id", "unknown"),
            "path": request.url.path,
            "exc_type": type(exc).__name__,
        },
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "服务器内部错误，请稍后重试",
            "request_id": getattr(request.state, "request_id", "unknown"),
        },
    )


@app.get("/health")
async def health_check():
    from core.database import engine
    from core.cache import cache

    # Check database connection
    db_status = "unknown"
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {e}"
        logger.warning(f"Database health check failed: {e}")

    # Check Redis connection
    cache_status = "unknown"
    try:
        if cache._client:
            await cache._client.ping()
        cache_status = "healthy"
    except Exception as e:
        cache_status = f"unhealthy: {e}"
        logger.warning(f"Redis health check failed: {e}")

    return {
        "status": "ok" if db_status == "healthy" else "degraded",
        "service": settings.app_name,
        "database": db_status,
        "cache": cache_status,
    }


# 路由
from apps.products.router import router as products_router
from apps.agents.router import router as agents_router
from apps.chat.router import router as chat_router
from apps.knowledge.router import router as knowledge_router
from apps.analytics.router import router as analytics_router
from apps.analytics.report_router import router as report_router
from apps.auth.router import router as auth_router
from apps.context.router import router as context_router

app.include_router(auth_router, prefix=settings.api_prefix, tags=["auth"])
app.include_router(products_router, prefix=f"{settings.api_prefix}/products", tags=["products"])
app.include_router(agents_router, prefix=f"{settings.api_prefix}/agents", tags=["agents"])
app.include_router(chat_router, prefix=f"{settings.api_prefix}/chat", tags=["chat"])
app.include_router(knowledge_router, prefix=f"{settings.api_prefix}/knowledge", tags=["knowledge"])
app.include_router(analytics_router, prefix=f"{settings.api_prefix}/analytics", tags=["analytics"])
app.include_router(report_router, prefix=f"{settings.api_prefix}/reports", tags=["reports"])
app.include_router(context_router, prefix=f"{settings.api_prefix}/context", tags=["context"])

# 静态文件服务
public_dir = os.path.join(os.path.dirname(__file__), "public")
if os.path.exists(public_dir):
    import mimetypes
    from pathlib import Path
    from fastapi.staticfiles import StaticFiles

    # 添加 webp MIME 类型
    mimetypes.add_type("image/webp", ".webp")

    # 使用 Path 确保跨平台路径正确
    public_path = Path(public_dir)

    app.mount("/static/top10", StaticFiles(directory=str(public_path / "top10")), name="top10")
    app.mount("/avatars", StaticFiles(directory=str(public_path / "avatars")), name="avatars")
    app.mount("/products", StaticFiles(directory=str(public_path / "products")), name="products")