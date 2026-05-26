from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    reason: str
    message: str


class ContactResponse(BaseModel):
    success: bool
    message: str


@router.post("/contact", response_model=ContactResponse)
async def submit_contact(form: ContactRequest):
    """提交联系我们表单"""
    # TODO: 接入邮件服务或数据库存储
    logger.info(f"Contact form submitted: {form.name} <{form.email}> - {form.reason}")
    return ContactResponse(
        success=True,
        message="您的留言已收到，我们将在24小时内回复您。"
    )