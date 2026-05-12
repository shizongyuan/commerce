"""
认证路由
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from core.auth import hash_password, verify_password, create_access_token
from core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# Mock 用户存储（生产环境应使用数据库）
MOCK_USERS = {
    "admin": {
        "id": "user-001",
        "email": "admin@example.com",
        "name": "管理员",
        "password": hash_password("admin123"),
        "role": "admin",
    },
}


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


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """用户登录"""
    user = MOCK_USERS.get(request.username)

    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    access_token = create_access_token(
        data={"sub": user["id"], "username": user["name"], "role": user["role"]},
        expires_delta=timedelta(minutes=settings.jwt_expire_minutes),
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
    if request.username in MOCK_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在",
        )

    user_id = f"user-{len(MOCK_USERS) + 1:03d}"
    MOCK_USERS[request.username] = {
        "id": user_id,
        "email": request.email,
        "name": request.name,
        "password": hash_password(request.password),
        "role": "viewer",
    }

    return RegisterResponse(
        id=user_id,
        email=request.email,
        name=request.name,
        message="注册成功",
    )


@router.get("/me")
async def get_current_user(token: str = Depends(lambda: None)):
    """获取当前用户信息"""
    return {"message": "需要登录后访问"}
