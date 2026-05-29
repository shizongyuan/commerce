"""
LLM Wiki 知识库路由
基于蚁群协作模式：Lead(协调) → Scout(侦察) → Worker(执行) → Reviewer(审查)
"""

import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Optional, List
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
import aiofiles

# 尝试导入文档处理库
try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    import pdftotext
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

logger = print

router = APIRouter(tags=["wiki"])

# ============ 配置 ============
BASE_DIR = Path(__file__).parent.parent.parent / "data" / "wiki"
RAW_DIR = BASE_DIR / "raw"
WIKI_DIR = BASE_DIR / "wiki"
UPLOAD_DIR = RAW_DIR / "documents"
DB_FILE = BASE_DIR / "wiki.db"

# 确保目录存在
RAW_DIR.mkdir(parents=True, exist_ok=True)
WIKI_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ============ 数据模型 ============
class DocumentModel(BaseModel):
    id: str
    title: str
    source_type: str  # doc/url/file
    source_path: str
    status: str  # pending/processing/done/failed
    concepts: List[str] = []
    summary: str = ""
    content: str = ""
    created_at: str
    updated_at: str

class DocumentCreate(BaseModel):
    title: str
    source_type: str
    source_path: str
    content: str = ""

class DocumentResponse(BaseModel):
    id: str
    title: str
    source_type: str
    source_path: str
    status: str
    concepts: List[str]
    summary: str
    created_at: str
    updated_at: str

# ============ SQLite 工具 ============
import sqlite3

def get_db():
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_path TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            concepts TEXT DEFAULT '[]',
            summary TEXT DEFAULT '',
            content TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wiki_pages (
            id TEXT PRIMARY KEY,
            document_id TEXT,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL,
            concepts TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id)
        )
    """)
    conn.commit()
    conn.close()

# 初始化数据库
init_db()

# ============ Scout Agent ============
class ScoutAgent:
    """侦察蚁 - 分析源文件，提取概念和摘要"""

    async def analyze(self, content: str, title: str) -> dict:
        """分析文档内容，提取关键概念"""
        # 简单实现：按行分割，提取关键词
        lines = content.split('\n')
        concepts = []

        # 提取标题中的关键词
        words = title.replace(' ', '').split('/')
        concepts.extend([w for w in words if len(w) > 2])

        # 提取内容中的关键词（简化版）
        words = content.replace('\n', ' ').split()
        word_freq = {}
        for word in words:
            if len(word) > 3 and word.isalpha():
                word_freq[word] = word_freq.get(word, 0) + 1

        # 取频率最高的词作为概念
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        concepts.extend([w for w, _ in sorted_words[:10]])

        # 去重并限制数量
        concepts = list(set(concepts))[:20]

        # 生成摘要（取前500字符）
        summary = content[:500] + "..." if len(content) > 500 else content

        return {
            "concepts": concepts,
            "summary": summary,
            "content_length": len(content)
        }

# ============ Worker Agent ============
class WorkerAgent:
    """工蚁 - 创建 Wiki 页面"""

    async def create_pages(self, doc_id: str, title: str, concepts: List[str], content: str) -> List[dict]:
        """创建 Wiki 页面"""
        created_pages = []

        # 创建主文档页面
        page_id = str(uuid.uuid4())
        page_title = f"文档_{title}"
        page_file = WIKI_DIR / "concepts" / f"{page_id}.md"

        page_content = f"""---
id: {page_id}
title: {title}
document_id: {doc_id}
created: {datetime.now().isoformat()}

---

# {title}

## 摘要
{content[:500]}...

## 关键概念
{', '.join(concepts[:10])}

## 来源
原始文档

## 相关概念
"""
        for concept in concepts[:5]:
            page_content += f"- [[{concept}]]\n"

        async with aiofiles.open(page_file, 'w', encoding='utf-8') as f:
            await f.write(page_content)

        created_pages.append({
            "id": page_id,
            "title": page_title,
            "file_path": str(page_file)
        })

        # 创建概念页面
        for i, concept in enumerate(concepts[:5]):
            concept_id = str(uuid.uuid4())
            concept_file = WIKI_DIR / "concepts" / f"{concept_id}.md"

            concept_content = f"""---
id: {concept_id}
concept: {concept}
related_document: {title}
created: {datetime.now().isoformat()}

---

# {concept}

> 来源：[[{title}]]

## 定义
{concept} 是本文档中的重要概念。

## 相关概念
{', '.join(concepts[:5])}

"""
            async with aiofiles.open(concept_file, 'w', encoding='utf-8') as f:
                await f.write(concept_content)

            created_pages.append({
                "id": concept_id,
                "title": concept,
                "file_path": str(concept_file)
            })

        return created_pages

# ============ Reviewer Agent ============
class ReviewerAgent:
    """护法 - 审查 Wiki 页面质量"""

    async def review(self, pages: List[dict]) -> dict:
        """审查页面质量"""
        issues = []

        for page in pages:
            file_path = Path(page["file_path"])
            if not file_path.exists():
                issues.append({
                    "file": page["title"],
                    "issue": "文件不存在",
                    "severity": "error"
                })
                continue

            # 检查文件内容
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            if len(content) < 50:
                issues.append({
                    "file": page["title"],
                    "issue": "内容过短",
                    "severity": "warning"
                })

            if "---" not in content:
                issues.append({
                    "file": page["title"],
                    "issue": "缺少 frontmatter",
                    "severity": "warning"
                })

        return {
            "status": "pass" if len([i for i in issues if i["severity"] == "error"]) == 0 else "fail",
            "issues": issues
        }

# ============ Lead 协调器 ============
class LeadAgent:
    """蚁后 - 协调整个消化流程"""

    def __init__(self):
        self.scout = ScoutAgent()
        self.worker = WorkerAgent()
        self.reviewer = ReviewerAgent()

    async def ingest(self, doc_id: str, title: str, content: str) -> dict:
        """执行完整的消化流程"""
        # Scout 阶段
        scout_result = await self.scout.analyze(content, title)

        # Worker 阶段
        pages = await self.worker.create_pages(
            doc_id=doc_id,
            title=title,
            concepts=scout_result["concepts"],
            content=content
        )

        # Reviewer 阶段
        review_result = await self.reviewer.review(pages)

        return {
            "document_id": doc_id,
            "concepts": scout_result["concepts"],
            "summary": scout_result["summary"],
            "pages_created": len(pages),
            "review": review_result
        }

# ============ API 端点 ============

@router.get("/documents")
async def list_documents(
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
):
    """获取文档列表"""
    conn = get_db()
    cursor = conn.cursor()

    # 构建查询
    if status:
        cursor.execute("SELECT * FROM documents WHERE status = ? ORDER BY created_at DESC", (status,))
    else:
        cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()

    # 分页
    total = len(rows)
    start = (page - 1) * page_size
    end = start + page_size
    items = [dict(row) for row in rows[start:end]]

    # 解析 JSON 字段
    for item in items:
        item["concepts"] = json.loads(item["concepts"]) if item["concepts"] else []

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/documents")
async def create_document(doc: DocumentCreate):
    """创建文档记录"""
    conn = get_db()
    cursor = conn.cursor()

    doc_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO documents (id, title, source_type, source_path, status, concepts, summary, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pending', '[]', '', '', ?, ?)
    """, (doc_id, doc.title, doc.source_type, doc.source_path, now, now))

    conn.commit()
    conn.close()

    return {"id": doc_id, "message": "文档创建成功"}

@router.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    """获取文档详情"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="文档不存在")

    doc = dict(row)
    doc["concepts"] = json.loads(doc["concepts"]) if doc["concepts"] else []
    return doc

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """删除文档"""
    conn = get_db()
    cursor = conn.cursor()

    # 检查是否存在
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="文档不存在")

    # 删除关联的 wiki 页面
    cursor.execute("SELECT file_path FROM wiki_pages WHERE document_id = ?", (doc_id,))
    pages = cursor.fetchall()
    for page in pages:
        try:
            os.remove(page["file_path"])
        except:
            pass

    cursor.execute("DELETE FROM wiki_pages WHERE document_id = ?", (doc_id,))
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()

    return {"message": "删除成功"}

@router.post("/ingest/{doc_id}")
async def ingest_document(doc_id: str):
    """消化文档 - 蚁群协作入口"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="文档不存在")

    doc = dict(row)
    conn.close()

    if not doc["content"]:
        raise HTTPException(status_code=400, detail="文档内容为空")

    # 更新状态为处理中
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE documents SET status = 'processing', updated_at = ? WHERE id = ?",
                  (datetime.now().isoformat(), doc_id))
    conn.commit()
    conn.close()

    # 执行蚁群协作
    lead = LeadAgent()
    result = await lead.ingest(doc_id, doc["title"], doc["content"])

    # 更新文档状态和概念
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE documents
        SET status = 'done', concepts = ?, summary = ?, updated_at = ?
        WHERE id = ?
    """, (
        json.dumps(result["concepts"]),
        result["summary"],
        datetime.now().isoformat(),
        doc_id
    ))
    conn.commit()
    conn.close()

    return {
        "message": "消化完成",
        "concepts": result["concepts"],
        "pages_created": result["pages_created"],
        "review": result["review"]
    }

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传文档文件"""
    # 检查文件类型
    allowed_types = {".txt", ".md", ".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""

    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型。允许: {', '.join(allowed_types)}"
        )

    # 生成唯一文件名
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    # 保存文件
    content = await file.read()
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "path": str(file_path),
        "url": f"/wiki/files/{unique_filename}"
    }

@router.get("/files/{filename}")
async def get_file(filename: str):
    """获取上传的文件"""
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="无效的文件名")

    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    return FileResponse(file_path)

@router.post("/fetch-url")
async def fetch_url(url: str = Form(...)):
    """抓取网页内容"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30.0)
            response.raise_for_status()

        return {
            "url": url,
            "content": response.text[:5000],  # 限制内容长度
            "title": url.split("/")[-1][:100]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"抓取失败: {str(e)}")

@router.get("/search")
async def search_wiki(q: str):
    """搜索 Wiki 内容"""
    if not q:
        return {"results": []}

    conn = get_db()
    cursor = conn.cursor()

    # 搜索文档
    cursor.execute("""
        SELECT * FROM documents
        WHERE (title LIKE ? OR content LIKE ? OR concepts LIKE ?)
        AND status = 'done'
        ORDER BY updated_at DESC
        LIMIT 20
    """, (f"%{q}%", f"%{q}%", f"%{q}%"))

    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        doc = dict(row)
        doc["concepts"] = json.loads(doc["concepts"]) if doc["concepts"] else []

        # 高亮匹配
        for key in ["title", "content", "summary"]:
            if doc.get(key):
                doc[f"{key}_highlight"] = doc[key].replace(q, f"<em>{q}</em>")[:200]

        results.append(doc)

    return {"results": results, "total": len(results)}

@router.get("/index")
async def get_index():
    """获取 Wiki 索引"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM wiki_pages ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    pages = []
    for row in rows:
        page = dict(row)
        page["concepts"] = json.loads(page["concepts"]) if page["concepts"] else []
        pages.append(page)

    return {"pages": pages, "total": len(pages)}

@router.post("/lint")
async def lint_wiki():
    """健康检查"""
    conn = get_db()
    cursor = conn.cursor()

    # 检查孤立页面
    cursor.execute("SELECT COUNT(*) as cnt FROM documents")
    doc_count = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM wiki_pages")
    page_count = cursor.fetchone()["cnt"]

    # 检查过期文档（30天未更新）
    cursor.execute("""
        SELECT * FROM documents
        WHERE status = 'done'
        AND datetime(updated_at) < datetime('now', '-30 days')
    """)
    stale_docs = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        "document_count": doc_count,
        "page_count": page_count,
        "stale_documents": len(stale_docs),
        "issues": [
            {"type": "stale_pages", "count": len(stale_docs), "severity": "warning"}
        ] if stale_docs else []
    }

@router.post("/process-upload")
async def process_upload(
    file: UploadFile = File(...),
    title: str = Form(...)
):
    """上传并处理文档"""
    # 1. 上传文件
    allowed_types = {".txt", ".md", ".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""

    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail=f"不支持的文件类型")

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    content = await file.read()
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    # 2. 提取文本内容
    extracted_content = ""
    try:
        if file_ext == ".txt" or file_ext == ".md":
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                extracted_content = await f.read()
        elif file_ext == ".pdf" and PDF_AVAILABLE:
            with open(file_path, 'rb') as f:
                extracted_content = pdftotext.from_bytes(f.read())
        elif file_ext == ".docx" and DOCX_AVAILABLE:
            doc = DocxDocument(file_path)
            extracted_content = "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        logger(f"内容提取失败: {e}")

    # 3. 创建文档记录
    conn = get_db()
    cursor = conn.cursor()

    doc_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO documents (id, title, source_type, source_path, status, concepts, summary, content, created_at, updated_at)
        VALUES (?, ?, 'file', ?, 'pending', '[]', '', ?, ?, ?)
    """, (doc_id, title, str(file_path), extracted_content, now, now))

    conn.commit()
    conn.close()

    # 4. 自动消化
    lead = LeadAgent()
    result = await lead.ingest(doc_id, title, extracted_content)

    # 5. 更新文档
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE documents
        SET status = 'done', concepts = ?, summary = ?, updated_at = ?
        WHERE id = ?
    """, (
        json.dumps(result["concepts"]),
        result["summary"],
        datetime.now().isoformat(),
        doc_id
    ))
    conn.commit()
    conn.close()

    return {
        "id": doc_id,
        "title": title,
        "concepts": result["concepts"],
        "pages_created": result["pages_created"],
        "content_length": len(extracted_content)
    }