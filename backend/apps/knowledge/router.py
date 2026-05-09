from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel
from core.database import get_db
import os
import re

router = APIRouter()

KNOWLEDGE_BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "agents", "knowledge")


class KnowledgeItem(BaseModel):
    path: str
    title: str
    content: str
    word_count: int


class KnowledgeListResponse(BaseModel):
    items: List[KnowledgeItem]
    total: int


def search_knowledge(query: str, max_results: int = 5) -> List[KnowledgeItem]:
    """Search knowledge base by keywords"""
    results = []
    query_lower = query.lower()

    if not os.path.exists(KNOWLEDGE_BASE):
        return results

    for root, dirs, files in os.walk(KNOWLEDGE_BASE):
        for file in files:
            if file.endswith(".md"):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()

                    # Simple keyword matching in title and first 500 chars
                    title = file.replace(".md", "").replace("_", " ").title()
                    preview = content[:500].lower()

                    if query_lower in title.lower() or query_lower in preview:
                        word_count = len(content.split())
                        results.append(
                            KnowledgeItem(
                                path=filepath,
                                title=title,
                                content=content[:2000],  # Limit content
                                word_count=word_count,
                            )
                        )
                except Exception:
                    continue

    return results[:max_results]


@router.get("/search")
async def search(
    q: str,
    max_results: int = 5,
    db: AsyncSession = Depends(get_db),
):
    results = search_knowledge(q, max_results)
    return KnowledgeListResponse(items=results, total=len(results))


@router.get("/files")
async def list_files(db: AsyncSession = Depends(get_db)):
    items = []
    if os.path.exists(KNOWLEDGE_BASE):
        for root, dirs, files in os.walk(KNOWLEDGE_BASE):
            for file in files:
                if file.endswith(".md"):
                    filepath = os.path.join(root, file)
                    relpath = os.path.relpath(filepath, KNOWLEDGE_BASE)
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                    items.append(
                        KnowledgeItem(
                            path=relpath,
                            title=file.replace(".md", "").replace("_", " ").title(),
                            content=content[:500],
                            word_count=len(content.split()),
                        )
                    )
    return KnowledgeListResponse(items=items, total=len(items))


@router.get("/file/{path:path}")
async def get_file(path: str, db: AsyncSession = Depends(get_db)):
    # 防止路径遍历攻击
    normalized = os.path.normpath(path)
    if normalized.startswith(".."):
        raise HTTPException(status_code=400, detail="Invalid path")

    filepath = os.path.join(KNOWLEDGE_BASE, normalized)
    # 确保文件在知识库目录内
    if not os.path.abspath(filepath).startswith(os.path.abspath(KNOWLEDGE_BASE)):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not os.path.exists(filepath) or not filepath.endswith(".md"):
        raise HTTPException(status_code=404, detail="File not found")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    return {"path": path, "content": content}
