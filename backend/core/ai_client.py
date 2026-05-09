from typing import Optional, List, Dict, Any
from openai import AsyncOpenAI
from core.config import settings


class QwenClient:
    """Qwen API 客户端"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        self.api_key = api_key or settings.qwen_api_key
        # 优先使用传入参数，否则从配置读取（不再硬编码 qwen-plus）
        self.model = model or settings.qwen_model
        self.base_url = base_url or settings.qwen_base_url
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
        return self._client

    async def close(self):
        self._client = None

    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500,
        stream: bool = False,
    ) -> Dict[str, Any]:
        """
        发送对话请求到 Qwen
        """
        if not self.api_key:
            return {
                "choices": [{"message": {"content": "Qwen API key not configured"}}],
                "error": "API key missing",
            }

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
            )
            return response.model_dump()
        except Exception as e:
            return {
                "choices": [{"message": {"content": f"Request failed: {e}"}}],
                "error": str(e),
            }

    async def embeddings(self, texts: List[str]) -> List[List[float]]:
        """获取文本嵌入向量"""
        if not self.api_key:
            return [[0.0] * 768 for _ in texts]

        try:
            response = await self.client.embeddings.create(
                model="text-embedding-v3",
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception:
            return [[0.0] * 768 for _ in texts]

    async def chat_stream(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500,
    ):
        """
        流式发送对话请求到 Qwen，yeild 每个 chunk
        """
        if not self.api_key:
            yield "Qwen API key not configured"
            return

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            yield f"Request failed: {e}"


# 全局单例
qwen_client = QwenClient()
