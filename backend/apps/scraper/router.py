"""
数据采集路由 - 基于 multi-agent-universal-scraper 框架
采用多Agent协作：研究员(分析) → 开发者(适配) → 测试员(验证) → 评审员(确认)
"""

import os
import uuid
import json
import asyncio
import subprocess
from datetime import datetime
from typing import Optional, List
from pathlib import Path

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

router = APIRouter(tags=["scraper"])

# ============ 配置 ============
SCRAPER_DIR = Path(__file__).parent
DATA_DIR = SCRAPER_DIR.parent.parent / "data" / "scrapes"
SCRAPER_SCRIPT = SCRAPER_DIR / "scraper.js"
TASKS_FILE = DATA_DIR / "tasks.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)

# ============ 数据模型 ============
class ScrapeRequest(BaseModel):
    url: str
    username: str
    password: str
    description: Optional[str] = ""

class ScrapeResponse(BaseModel):
    task_id: str
    message: str

class TaskStatus(BaseModel):
    task_id: str
    url: str
    status: str  # pending/running/done/failed
    message: str
    created_at: str
    completed_at: Optional[str] = None
    result_file: Optional[str] = None
    record_count: int = 0

# ============ 任务管理 ============
def load_tasks() -> dict:
    if TASKS_FILE.exists():
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_tasks(tasks: dict):
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

def create_task(url: str, username: str, password: str, description: str = "") -> str:
    task_id = str(uuid.uuid4())[:8]
    tasks = load_tasks()
    tasks[task_id] = {
        "task_id": task_id,
        "url": url,
        "username": username,
        "status": "pending",
        "message": "任务已创建，等待执行",
        "created_at": datetime.now().isoformat(),
        "completed_at": None,
        "result_file": None,
        "record_count": 0,
        "description": description
    }
    save_tasks(tasks)
    return task_id

def update_task(task_id: str, **kwargs):
    tasks = load_tasks()
    if task_id in tasks:
        tasks[task_id].update(kwargs)
        save_tasks(tasks)

# ============ 采集执行 ============
async def run_scraper(task_id: str, url: str, username: str, password: str, description: str = ""):
    """后台执行采集脚本"""
    update_task(task_id, status="running", message="正在启动浏览器...")

    try:
        # 使用 Node.js 执行采集脚本
        cmd = [
            "node",
            str(SCRAPER_SCRIPT),
            "--url", url,
            "--username", username,
            "--password", password,
            "--taskid", task_id,
            "--output", str(DATA_DIR)
        ]
        if description:
            cmd.extend(["--description", description])

        update_task(task_id, message="正在采集数据...")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5分钟超时
        )

        if result.returncode == 0:
            # 解析输出获取结果文件
            output = result.stdout
            # 尝试从输出中提取结果文件路径
            for line in output.split('\n'):
                if '"file"' in line or 'result' in line.lower():
                    try:
                        # 简单解析 JSON 输出
                        if '{' in line:
                            json_start = line.find('{')
                            json_str = line[json_start:]
                            if '}' not in json_str:
                                json_str += '}'
                            data = json.loads(json_str)
                            if data.get('file'):
                                update_task(task_id,
                                    status="done",
                                    message="采集完成",
                                    completed_at=datetime.now().isoformat(),
                                    result_file=data['file'],
                                    record_count=data.get('recordCount', 0)
                                )
                                return
                    except:
                        pass

            # 默认成功
            update_task(task_id,
                status="done",
                message="采集完成",
                completed_at=datetime.now().isoformat(),
                record_count=0
            )
        else:
            update_task(task_id,
                status="failed",
                message=f"采集失败: {result.stderr[:200]}",
                completed_at=datetime.now().isoformat()
            )

    except subprocess.TimeoutExpired:
        update_task(task_id, status="failed", message="采集超时(5分钟)", completed_at=datetime.now().isoformat())
    except Exception as e:
        update_task(task_id, status="failed", message=f"采集异常: {str(e)[:100]}", completed_at=datetime.now().isoformat())

# ============ API 端点 ============

@router.post("/scrape", response_model=ScrapeResponse)
async def create_scrape_task(req: ScrapeRequest, background_tasks: BackgroundTasks):
    """创建数据采集任务"""
    # 验证URL格式
    if not req.url.startswith(('http://', 'https://')):
        raise HTTPException(status_code=400, detail="无效的URL格式")

    task_id = create_task(req.url, req.username, req.password, req.description)

    # 后台执行采集
    background_tasks.add_task(run_scraper, task_id, req.url, req.username, req.password, req.description)

    return ScrapeResponse(task_id=task_id, message="任务已创建，正在后台执行")

@router.get("/scrape/tasks")
async def list_tasks():
    """获取所有采集任务"""
    tasks = load_tasks()
    return {"items": list(tasks.values()), "total": len(tasks)}

@router.get("/scrape/tasks/{task_id}")
async def get_task(task_id: str):
    """获取任务状态"""
    tasks = load_tasks()
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    return tasks[task_id]

@router.get("/scrape/results")
async def list_results():
    """获取采集结果列表"""
    items = []
    if DATA_DIR.exists():
        for f in DATA_DIR.iterdir():
            if f.suffix in ('.json', '.xlsx'):
                items.append({
                    "filename": f.name,
                    "path": str(f),
                    "size": f.stat().st_size,
                    "created_at": datetime.fromtimestamp(f.stat().st_ctime).isoformat()
                })
    return {"items": items, "total": len(items)}

@router.get("/scrape/results/{filename}")
async def download_result(filename: str):
    """下载采集结果文件"""
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="无效的文件名")

    file_path = DATA_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    ext = file_path.suffix.lower()
    media_type = "application/json" if ext == ".json" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    return FileResponse(file_path, media_type=media_type, filename=filename)

@router.delete("/scrape/tasks/{task_id}")
async def delete_task(task_id: str):
    """删除任务"""
    tasks = load_tasks()
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")

    task = tasks[task_id]
    # 删除结果文件
    if task.get('result_file'):
        try:
            Path(task['result_file']).unlink()
        except:
            pass

    del tasks[task_id]
    save_tasks(tasks)
    return {"message": "删除成功"}