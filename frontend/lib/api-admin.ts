// 后台管理 API 配置
import { API_CONFIG } from "./config";

export const api = {
  baseUrl: API_CONFIG.API_URL,
  endpoints: {
    products: `${API_CONFIG.API_URL}/api/products`,
    agents: `${API_CONFIG.API_URL}/api/agents`,
    analytics: `${API_CONFIG.API_URL}/api/analytics`,
    chat: `${API_CONFIG.API_URL}/api/chat`,
    knowledge: `${API_CONFIG.API_URL}/api/knowledge`,
  },
};

export default api;