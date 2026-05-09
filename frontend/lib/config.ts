// 统一 API 地址配置
// 使用环境变量，前端请求统一调用此配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004";

export const config = {
  API_BASE_URL,
};

export default config;