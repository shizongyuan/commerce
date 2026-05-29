"""
初始化企业知识库数据
运行：cd scripts && python init_wiki_data.py
"""
import os
import sys
import sqlite3
import json
import uuid
from datetime import datetime

# 添加后端路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

WIKI_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'wiki')
DOCS_DIR = os.path.join(WIKI_DIR, 'raw', 'documents')
DB_FILE = os.path.join(WIKI_DIR, 'wiki.db')

def get_db():
    conn = sqlite3.connect(DB_FILE)
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

def load_document(file_path):
    """加载文档内容"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def save_document(title, content, source_type, source_path):
    """保存文档到数据库"""
    conn = get_db()
    cursor = conn.cursor()

    doc_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    # 生成摘要（前200字符）
    summary = content[:200] + "..." if len(content) > 200 else content

    cursor.execute("""
        INSERT INTO documents (id, title, source_type, source_path, status, concepts, summary, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'done', '[]', ?, ?, ?, ?)
    """, (doc_id, title, source_type, source_path, summary, content, now, now))

    conn.commit()
    conn.close()

    return doc_id

def main():
    print("初始化知识库数据...")

    # 确保目录存在
    os.makedirs(DOCS_DIR, exist_ok=True)
    init_db()

    # 加载已存在的文档
    files = [
        'company-intro.md',
        'product-catalog.md',
        'ai-service-guide.md',
    ]

    for filename in files:
        file_path = os.path.join(DOCS_DIR, filename)
        if os.path.exists(file_path):
            content = load_document(file_path)
            title = filename.replace('.md', '').replace('-', ' ').title()
            doc_id = save_document(title, content, 'file', file_path)
            print(f"  + {title}")
        else:
            print(f"  - {filename} (未找到)")

    print(f"\n完成！共导入 {len(files)} 个文档")
    print(f"数据库位置: {DB_FILE}")

if __name__ == '__main__':
    main()