"""
认证路由
"""

import os
from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from core.auth import hash_password, verify_password, create_access_token, get_current_user_id
from core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    name: str


class RegisterResponse(BaseModel):
    id: str
    email: str
    name: str
    message: str


def get_mock_admin_user():
    """获取 Mock Admin 用户（延迟密码哈希计算）"""
    try:
        password = settings.admin_password
        return {
            "id": "user-001",
            "email": "admin@example.com",
            "name": "管理员",
            "password": hash_password(password),
            "role": "admin",
        }
    except RuntimeError as e:
        logger.warning(f"ADMIN_PASSWORD not set, admin login disabled: {e}")
        return None


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, login_request: LoginRequest, response: Response):
    """用户登录 - 已禁用鉴权，直接返回管理员权限"""
    # 构建固定用户
    mock_users = {
        "admin": {
            "id": "user-001",
            "email": "admin@example.com",
            "name": "管理员",
            "password": "admin",  # 任意密码均可登录
            "role": "admin",
        }
    }

    user = mock_users.get(login_request.username) or mock_users["admin"]

    access_token = create_access_token(
        data={"sub": user["id"], "username": user["name"], "role": user["role"]},
        expires_delta=timedelta(minutes=settings.jwt_expire_minutes),
    )

    # 设置 HttpOnly Cookie
    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
    )

    return LoginResponse(
        access_token=access_token,
        user={
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    )


@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    """用户注册"""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="注册功能已禁用，请联系管理员",
    )


@router.get("/me")
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """获取当前用户信息"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录或 Token 已过期",
        )
    # Find user by ID - check admin first
    admin_user = get_mock_admin_user()
    if admin_user and admin_user["id"] == user_id:
        return {
            "id": admin_user["id"],
            "name": admin_user["name"],
            "email": admin_user["email"],
            "role": admin_user["role"],
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="用户不存在",
    )