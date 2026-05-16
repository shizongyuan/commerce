/**
 * 共享配置 - 前端统一管理 API 配置
 * 解决多个文件重复定义 API_URL 的问题
 */

// API 配置
export const API_CONFIG = {
  // 后端 API 地址
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004",

  // 前台网站地址（用于聊天等功能）
  WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3001",

  // 超时设置（毫秒）
  TIMEOUT: 30000,

  // API 版本
  API_VERSION: "v1",
} as const;

// 辅助函数：获取完整的 API URL
export function getApiUrl(path: string): string {
  const base = API_CONFIG.API_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// 辅助函数：获取网站 URL
export function getWebsiteUrl(path: string): string {
  const base = API_CONFIG.WEBSITE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// 辅助函数：构建聊天 URL
export function getChatUrl(agentId: string): string {
  return `${API_CONFIG.WEBSITE_URL}/chat?agent=${encodeURIComponent(agentId)}`;
}

export default API_CONFIG;