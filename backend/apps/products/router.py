from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, Field
from core.database import get_db, DB_AVAILABLE
from repositories.product import ProductRepository
from core.cache import cache, CacheKeys, CacheTTL
from core.auth import get_current_user_id
from core.config import settings
from data.mock_products import MOCK_PRODUCTS
import os
import uuid
import aiofiles
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
ALLOWED_IMAGE_TYPES = {
    ".jpeg": {"mime": "image/jpeg", "magic": [0xFF, 0xD8, 0xFF]},
    ".png": {"mime": "image/png", "magic": [0x89, 0x50, 0x4E, 0x47]},
    ".webp": {"mime": "image/webp", "magic": [0x52, 0x49, 0x46, 0x46]},  # RIFF header
    ".gif": {"mime": "image/gif", "magic": [0x47, 0x49, 0x46]},
}

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Magic number length for validation
MAGIC_LENGTH = 4


def validate_image_content(content: bytes, file_ext: str) -> bool:
    """Validate actual file content using magic bytes"""
    if file_ext.lower() not in ALLOWED_IMAGE_TYPES:
        return False

    magic = ALLOWED_IMAGE_TYPES[file_ext.lower()]["magic"]

    # For WebP, we need to check RIFF header differently
    if file_ext.lower() == ".webp":
        return content[:4] == b"RIFF" and content[8:12] == b"WEBP"

    # Standard magic byte check
    return content[:len(magic)] == bytes(magic)


# Schema
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., max_length=100)
    price: float = Field(..., gt=0, le=999999.99)
    stock: int = Field(default=0, ge=0)
    description: Optional[str] = None
    images: List[str] = Field(default_factory=list)


class ProductCreate(ProductBase):
    asin: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    asin: Optional[str] = None
    status: str = "active"

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    keyword: Optional[str] = None,
):
    # 如果数据库不可用，直接使用 mock 数据
    if not DB_AVAILABLE:
        filtered = MOCK_PRODUCTS
        if category:
            filtered = [p for p in filtered if p["category"].lower() == category.lower()]
        if keyword:
            filtered = [p for p in filtered if keyword.lower() in p["name"].lower()]

        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        items = [ProductResponse(**p) for p in filtered[start:end]]

        return ProductListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )

    # Try cache first (with error handling)
    cache_key = CacheKeys.product_list(category, page)
    try:
        cached = await cache.get(cache_key)
        if cached and not keyword and not category:
            return ProductListResponse(**cached)
    except Exception as cache_err:
        logger.warning(f"Cache get failed, continuing without cache: {cache_err}")

    # Try database
    try:
        db = await get_db()
        if db is None:
            raise Exception("Database not available")

        repo = ProductRepository(db)
        skip = (page - 1) * page_size

        if keyword:
            products = await repo.search(keyword, skip, page_size)
            total = len(products)
        elif category:
            products = await repo.get_by_category(category, skip, page_size)
            total = len(products)
        else:
            products = await repo.get_all(skip, page_size)
            total = len(products)

        items = [
            ProductResponse(
                id=str(p.id),
                name=p.name,
                asin=p.asin,
                category=p.category,
                price=p.price,
                stock=p.stock,
                description=p.description,
                images=p.images or [],
                status=p.status,
            )
            for p in products
        ]

        response = ProductListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )

        if not keyword and not category:
            try:
                await cache.set(cache_key, response.model_dump(), expire=CacheTTL.PRODUCT_LIST)
            except Exception as cache_err:
                logger.warning(f"Cache set failed: {cache_err}")

        return response

    except Exception as e:
        logger.error(f"Database query failed, falling back to mock data: {e}")
        # Fallback to mock data
        filtered = MOCK_PRODUCTS
        if category:
            filtered = [p for p in filtered if p["category"].lower() == category.lower()]
        if keyword:
            filtered = [p for p in filtered if keyword.lower() in p["name"].lower()]

        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        items = [ProductResponse(**p) for p in filtered[start:end]]

        return ProductListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )


@router.get("/{product_id}", response_model=ProductResponse, dependencies=[Depends(get_current_user_id)])
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    # Try cache first
    cache_key = CacheKeys.product(product_id)
    cached = await cache.get(cache_key)
    if cached:
        return ProductResponse(**cached)

    # Try database
    try:
        repo = ProductRepository(db)
        from uuid import UUID
        product = await repo.get_by_id(UUID(product_id))

        if not product:
            # Try mock data
            for p in MOCK_PRODUCTS:
                if p["id"] == product_id:
                    return ProductResponse(**p)
            raise HTTPException(status_code=404, detail="Product not found")

        response = ProductResponse(
            id=str(product.id),
            name=product.name,
            asin=product.asin,
            category=product.category,
            price=product.price,
            stock=product.stock,
            description=product.description,
            images=product.images or [],
            status=product.status,
        )
        await cache.set(cache_key, response.model_dump(), expire=CacheTTL.PRODUCT)
        return response

    except ValueError:
        # Invalid UUID, try mock data
        for p in MOCK_PRODUCTS:
            if p["id"] == product_id:
                return ProductResponse(**p)
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Product fetch failed: {e}")
        # In debug mode, try mock data; otherwise return error
        if settings.debug:
            for p in MOCK_PRODUCTS:
                if p["id"] == product_id:
                    return ProductResponse(**p)
        raise HTTPException(status_code=500, detail="Failed to fetch product")


@router.post("", response_model=ProductResponse, dependencies=[Depends(get_current_user_id)])
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    try:
        repo = ProductRepository(db)
        data = product.model_dump()
        if data.get("asin") is None:
            data["asin"] = f"ASIN-{product.name[:3].upper()}-{product.category[:3].upper()}"
        data["status"] = "active"

        created = await repo.create(data)
        await cache.delete(CacheKeys.product_list())

        return ProductResponse(
            id=str(created.id),
            name=created.name,
            asin=created.asin,
            category=created.category,
            price=created.price,
            stock=created.stock,
            description=created.description,
            images=created.images or [],
            status=created.status,
        )
    except Exception:
        # Mock mode: create with mock ID
        new_product = {
            "id": f"prod-{len(MOCK_PRODUCTS) + 1:03d}",
            "asin": product.asin or f"ASIN-{product.name[:3].upper()}-{product.category[:3].upper()}",
            **product.model_dump(),
            "status": "active",
        }
        MOCK_PRODUCTS.append(new_product)
        return ProductResponse(**new_product)


@router.put("/{product_id}", response_model=ProductResponse, dependencies=[Depends(get_current_user_id)])
async def update_product(
    product_id: str,
    product: ProductUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        repo = ProductRepository(db)
        from uuid import UUID
        uuid_id = UUID(product_id)

        existing = await repo.get_by_id(uuid_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")

        update_data = product.model_dump(exclude_unset=True)
        updated = await repo.update(uuid_id, update_data)

        await cache.delete(CacheKeys.product(product_id))
        await cache.delete(CacheKeys.product_list())  # 清除默认列表缓存

        return ProductResponse(
            id=str(updated.id),
            name=updated.name,
            asin=updated.asin,
            category=updated.category,
            price=updated.price,
            stock=updated.stock,
            description=updated.description,
            images=updated.images or [],
            status=updated.status,
        )
    except (ValueError, HTTPException):
        raise
    except Exception:
        # Mock mode
        for i, p in enumerate(MOCK_PRODUCTS):
            if p["id"] == product_id:
                update_data = product.model_dump(exclude_unset=True)
                MOCK_PRODUCTS[i].update(update_data)
                return ProductResponse(**MOCK_PRODUCTS[i])
        raise HTTPException(status_code=404, detail="Product not found")


@router.delete("/{product_id}", dependencies=[Depends(get_current_user_id)])
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    try:
        repo = ProductRepository(db)
        from uuid import UUID
        uuid_id = UUID(product_id)

        existing = await repo.get_by_id(uuid_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")

        await repo.delete(uuid_id)
        await cache.delete(CacheKeys.product(product_id))
        await cache.delete(CacheKeys.product_list())  # 清除默认列表缓存

        return {"message": "Product deleted"}
    except (ValueError, HTTPException):
        raise
    except Exception:
        # Mock mode
        for i, p in enumerate(MOCK_PRODUCTS):
            if p["id"] == product_id:
                MOCK_PRODUCTS.pop(i)
                return {"message": "Product deleted"}
        raise HTTPException(status_code=404, detail="Product not found")


# ========================================
# 产品图片上传/下载 API
# ========================================

# 图片存储目录
PRODUCTS_IMAGE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), 
    "public", "products"
)


@router.post("/upload-image", dependencies=[Depends(get_current_user_id)])
async def upload_product_image(
    file: UploadFile = File(...),
):
    """上传产品图片"""
    # 确保目录存在
    os.makedirs(PRODUCTS_IMAGE_DIR, exist_ok=True)

    # 生成唯一文件名
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""

    # 限制文件类型 - 检查扩展名
    if file_ext.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES.keys())}"
        )

    # 读取文件内容
    content = await file.read()

    # 限制文件大小
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # 验证文件 magic bytes
    if not validate_image_content(content, file_ext):
        logger.warning(f"Image upload rejected - invalid content type: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid image content")

    # 生成唯一文件名
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(PRODUCTS_IMAGE_DIR, unique_filename)

    # 异步保存文件
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # 返回本地URL路径
    image_url = f"/products/{unique_filename}"
    logger.info(f"Image uploaded successfully: {unique_filename}")
    return {
        "success": True,
        "filename": unique_filename,
        "url": image_url,
    }


@router.get("/images/{filename}", dependencies=[Depends(get_current_user_id)])
async def get_product_image(filename: str):
    """获取产品图片 - 需要认证"""
    # 防止路径遍历攻击
    if ".." in filename or filename.startswith("/"):
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = os.path.join(PRODUCTS_IMAGE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")

    # 确定 content type
    import mimetypes
    content_type, _ = mimetypes.guess_type(file_path)
    if content_type is None:
        content_type = "image/jpeg"

    return FileResponse(
        file_path,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=31536000"}
    )
