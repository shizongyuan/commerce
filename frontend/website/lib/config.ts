/**
 * 前端统一配置
 */

const API_URL = "https://work.muruai.cn/api";
const WEBSITE_URL = "https://work.muruai.cn";

export const API_CONFIG = {
  API_URL,
  WEBSITE_URL,
  TIMEOUT: 30000,
  API_VERSION: "v1",
} as const;

export function getApiUrl(path: string): string {
  return `${API_CONFIG.API_URL}${path}`;
}

export function getWebsiteUrl(path: string): string {
  return `${API_CONFIG.WEBSITE_URL}${path}`;
}

export function getChatUrl(agentId: string): string {
  return `${API_CONFIG.WEBSITE_URL}/chat?agent=${encodeURIComponent(agentId)}`;
}

export default API_CONFIG;