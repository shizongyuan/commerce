// 后台管理 API 配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export const api = {
  baseUrl: API_BASE_URL,
  endpoints: {
    products: `${API_BASE_URL}/api/products`,
    agents: `${API_BASE_URL}/api/agents`,
    analytics: `${API_BASE_URL}/api/analytics`,
    chat: `${API_BASE_URL}/api/chat`,
    knowledge: `${API_BASE_URL}/api/knowledge`,
  },
};

export default api;