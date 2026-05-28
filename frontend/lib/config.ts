/**
 * 共享配置 - 前端统一管理 API 配置
 */

export const API_CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL || "",
} as const;

export function getApiUrl(path: string): string {
  const base = API_CONFIG.API_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function getAdminUrl(path: string): string {
  const base = API_CONFIG.ADMIN_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export default API_CONFIG;