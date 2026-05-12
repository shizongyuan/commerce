from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, Field
from core.database import get_db
from repositories.product import ProductRepository
from core.cache import cache, CacheKeys

router = APIRouter()


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

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int


# Mock data fallback (22款产品)
MOCK_PRODUCTS = [
    {"id": "prod-001", "asin": "B09N5ZNWWX", "name": "Premium Skincare Set", "category": "Skincare", "price": 299.00, "stock": 156, "rating": 4.5, "review_count": 128, "description": "高端护肤套装，含洁面乳、精华液、面霜。源自日本原料，温和配方适合各种肤质，深层滋养让肌肤焕发活力。", "images": ["https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-002", "asin": "B09N5ZNWWY", "name": "Luxury Makeup Palette", "category": "Makeup", "price": 399.00, "stock": 89, "rating": 4.7, "review_count": 256, "description": "12色眼影盘，哑光珠光混合。色彩饱满持久，一盘多用打造日常到派对各种妆容。", "images": ["https://images.unsplash.com/photo-1667369039699-f30c4b863e51?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-003", "asin": "B09N5ZNWWZ", "name": "Wireless Earbuds Pro", "category": "Electronics", "price": 599.00, "stock": 203, "rating": 4.3, "review_count": 512, "description": "主动降噪蓝牙耳机，30小时续航。高保真音质，人体工学设计，佩戴舒适。", "images": ["https://images.unsplash.com/photo-1773874958365-919ab8b526a5?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-004", "asin": "B09N5ZNAA1", "name": "深层保湿面膜套装", "category": "Skincare", "price": 129.00, "stock": 320, "rating": 4.6, "review_count": 89, "description": "10片装深层补水面膜，含玻尿酸成分。急救补水，敷出水润肌，适合熬夜后修复。", "images": ["https://images.unsplash.com/photo-1619451334792-150fd785ee74?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-005", "asin": "B09N5ZNAA2", "name": "经典色号口红", "category": "Makeup", "price": 189.00, "stock": 156, "rating": 4.8, "review_count": 342, "description": "滋润型哑光口红，经典正红色。丝绒质地不干涩，持久显色提升气色。", "images": ["https://images.unsplash.com/photo-1627260125392-af975289f53f?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-006", "asin": "B09N5ZNAA3", "name": "智能手环Pro", "category": "Electronics", "price": 299.00, "stock": 178, "rating": 4.4, "review_count": 234, "description": "心率监测、血氧检测、7天续航。轻巧设计，IP68防水，智能提醒生活更高效。", "images": ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-007", "asin": "B09N5ZNAA4", "name": "氨基酸洁面乳", "category": "Skincare", "price": 89.00, "stock": 450, "rating": 4.5, "review_count": 567, "description": "温和氨基酸配方，深层清洁不紧绷。弱酸性接近肌肤pH值，敏感肌也能用。", "images": ["https://images.unsplash.com/photo-1556228720-195a672e8a03?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-008", "asin": "B09N5ZNAA5", "name": "遮瑕修容盘", "category": "Makeup", "price": 159.00, "stock": 120, "rating": 4.3, "review_count": 145, "description": "6色遮瑕盘，痘印黑眼圈一键隐匿。质地细腻服帖，轻松打造无瑕底妆。", "images": ["https://images.unsplash.com/photo-1631730486572-226d1f595b68?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-009", "asin": "B09N5ZNAA6", "name": "便携式蓝牙音箱", "category": "Electronics", "price": 199.00, "stock": 230, "rating": 4.6, "review_count": 423, "description": "迷你便携音响，360°环绕音效。掌心大小，IPX7防水，户外聚会必备。", "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-010", "asin": "B09N5ZNAA7", "name": "抗老精华液", "category": "Skincare", "price": 459.00, "stock": 98, "rating": 4.7, "review_count": 198, "description": "视黄醇抗衰老精华，淡化细纹紧致肌肤。夜间修复，重拾年轻弹润。", "images": ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-011", "asin": "B09N5ZNAA8", "name": "防水眼线笔", "category": "Makeup", "price": 69.00, "stock": 380, "rating": 4.2, "review_count": 289, "description": "极细笔尖，防水防晕染持妆一整天。一笔勾勒精致眼妆，新手也能轻松上手。", "images": ["https://images.unsplash.com/photo-1631730486572-226d1f595b68?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-012", "asin": "B09N5ZNAA9", "name": "无线充电宝", "category": "Electronics", "price": 149.00, "stock": 265, "rating": 4.5, "review_count": 534, "description": "10000mAh大容量，支持无线+有线双快充。随放随充，告别线材束缚。", "images": ["https://images.unsplash.com/photo-1606220838315-056192d5e927?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-013", "asin": "B09N5ZNB01", "name": "VC亮肤精华液", "category": "Skincare", "price": 228.00, "stock": 186, "rating": 4.6, "review_count": 312, "description": "高浓度VC精华，淡化色斑提亮肤色。抗氧化成分，改善暗沉焕发白皙光彩。", "images": ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-014", "asin": "B09N5ZNB02", "name": "定妆散粉套装", "category": "Makeup", "price": 139.00, "stock": 210, "rating": 4.4, "review_count": 178, "description": "微米级细腻散粉，控油持妆打造柔焦妆感。轻薄透气不闷痘，定妆一整天。", "images": ["https://images.unsplash.com/photo-1631730486572-226d1f595b68?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-015", "asin": "B09N5ZNB03", "name": "智能台灯护眼灯", "category": "Electronics", "price": 179.00, "stock": 145, "rating": 4.7, "review_count": 256, "description": "无极调光护眼台灯，模拟自然光色温。触控操作简约设计，保护视力从光开始。", "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-016", "asin": "B09N5ZNB04", "name": "玻尿酸面霜", "category": "Skincare", "price": 258.00, "stock": 298, "rating": 4.5, "review_count": 423, "description": "深层补水保湿面霜，含多重玻尿酸分子。锁水保湿一整天，敏感肌可用。", "images": ["https://images.unsplash.com/photo-1619451334792-150fd785ee74?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-017", "asin": "B09N5ZNB05", "name": "眉笔眉粉组合", "category": "Makeup", "price": 79.00, "stock": 420, "rating": 4.3, "review_count": 367, "description": "三合一眉笔，眉粉眉刷应有尽有。自然雾眉效果，手残党也能画出完美眉形。", "images": ["https://images.unsplash.com/photo-1627260125392-af975289f53f?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-018", "asin": "B09N5ZNB06", "name": "蓝牙键盘静音", "category": "Electronics", "price": 259.00, "stock": 167, "rating": 4.6, "review_count": 198, "description": "无线蓝牙键盘，静音按键设计。兼容多设备，办公游戏两相宜。", "images": ["https://images.unsplash.com/photo-1773874958365-919ab8b526a5?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-019", "asin": "B09N5ZNB07", "name": "身体乳保湿套装", "category": "Skincare", "price": 118.00, "stock": 356, "rating": 4.4, "review_count": 289, "description": "清爽不黏腻身体乳，长效保湿72小时。淡淡花香，肌肤细腻光滑一整天。", "images": ["https://images.unsplash.com/photo-1556228720-195a672e8a03?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-020", "asin": "B09N5ZNB08", "name": "腮红高光一体盘", "category": "Makeup", "price": 169.00, "stock": 189, "rating": 4.5, "review_count": 234, "description": "6色腮红高光组合，珠光哑光兼备。一盘搞定立体轮廓，自然通透好气色。", "images": ["https://images.unsplash.com/photo-1667369039699-f30c4b863e51?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-021", "asin": "B09N5ZNB09", "name": "移动固态硬盘1TB", "category": "Electronics", "price": 699.00, "stock": 78, "rating": 4.8, "review_count": 156, "description": "高速Type-C接口固态硬盘，读取速度1050MB/s。轻薄便携，数据存储无忧。", "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?fm=jpg&w=800"], "status": "active"},
    {"id": "prod-022", "asin": "B09N5ZNB10", "name": "眼霜抗皱紧致", "category": "Skincare", "price": 329.00, "stock": 134, "rating": 4.7, "review_count": 267, "description": "专研抗皱眼霜，淡化鱼尾纹黑眼圈。紧致提拉眼周，重现年轻双眸。", "images": ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?fm=jpg&w=800"], "status": "active"},
]


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    # Try cache first
    cache_key = CacheKeys.product_list(category, page)
    cached = await cache.get(cache_key)
    if cached and not keyword and not category:
        return ProductListResponse(**cached)

    # Try database
    try:
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
            await cache.set(cache_key, response.model_dump(), expire=300)

        return response

    except Exception:
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


@router.get("/{product_id}", response_model=ProductResponse)
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
        await cache.set(cache_key, response.model_dump(), expire=3600)
        return response

    except ValueError:
        # Invalid UUID, try mock data
        for p in MOCK_PRODUCTS:
            if p["id"] == product_id:
                return ProductResponse(**p)
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    except HTTPException:
        raise
    except Exception:
        # Try mock data
        for p in MOCK_PRODUCTS:
            if p["id"] == product_id:
                return ProductResponse(**p)
        raise HTTPException(status_code=404, detail="Product not found")


@router.post("", response_model=ProductResponse)
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


@router.put("/{product_id}", response_model=ProductResponse)
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
        await cache.delete(CacheKeys.product_list())

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


@router.delete("/{product_id}")
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
        await cache.delete(CacheKeys.product_list())

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
