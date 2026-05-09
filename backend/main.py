from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uuid
from core.config import settings
from core.ai_client import qwen_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ = qwen_client.client
    yield
    await qwen_client.close()


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
    request.state.request_id = str(uuid.uuid4())[:8]
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
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
    return {"status": "ok", "service": settings.app_name}


# 路由
from apps.products.router import router as products_router
from apps.agents.router import router as agents_router
from apps.chat.router import router as chat_router
from apps.knowledge.router import router as knowledge_router
from apps.analytics.router import router as analytics_router
from apps.analytics.report_router import router as report_router

app.include_router(products_router, prefix=f"{settings.api_prefix}/products", tags=["products"])
app.include_router(agents_router, prefix=f"{settings.api_prefix}/agents", tags=["agents"])
app.include_router(chat_router, prefix=f"{settings.api_prefix}/chat", tags=["chat"])
app.include_router(knowledge_router, prefix=f"{settings.api_prefix}/knowledge", tags=["knowledge"])
app.include_router(analytics_router, prefix=f"{settings.api_prefix}/analytics", tags=["analytics"])
app.include_router(report_router, prefix=f"{settings.api_prefix}/reports", tags=["reports"])