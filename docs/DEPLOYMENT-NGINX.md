# Nginx 部署配置参考

## 前端静态文件部署

假设：
- 官网静态文件：`/wwwroot/commerce/frontend/website-out/`
- 管理后台静态文件：`/wwwroot/commerce/frontend/admin-out/`

### Nginx 配置

```nginx
# 官网静态文件（根路径）
location / {
    root /wwwroot/commerce/frontend/website-out;
    index index.html;
    try_files $uri $uri/ /index.html;
}

# 管理后台静态文件
location /admin {
    alias /wwwroot/commerce/frontend/admin-out;
    index index.html;
    try_files $uri $uri/ /admin/index.html;
}

# 静态资源（产品图片、头像等）
location /products {
    proxy_pass http://127.0.0.1:8004/products;
    proxy_set_header Host $host;
}

location /avatars {
    proxy_pass http://127.0.0.1:8004/avatars;
    proxy_set_header Host $host;
}

# API 反向代理
location /api {
    proxy_pass http://127.0.0.1:8004;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# SSE 流式响应（关键配置）
location /api/chat/stream {
    proxy_pass http://127.0.0.1:8004;
    proxy_set_header Host $host;
    proxy_buffering off;
    proxy_cache off;
    chunked_transfer_encoding on;
    tcp_nodelay on;
}
```

## 构建步骤

```batch
# 1. 构建官网
cd C:\projeck\commerce-merge\frontend
call npm run build:website
# 输出到 website-out/

# 2. 构建管理后台
call npm run build:admin
# 输出到 admin-out/

# 3. 将 website-out/ 和 admin-out/ 上传到服务器
# 假设服务器路径为 /wwwroot/commerce/frontend/
```

## 验证清单

- [ ] 访问 `/` 显示官网首页
- [ ] 访问 `/admin` 重定向到 `/admin/dashboard`
- [ ] 访问 `/products` 显示产品列表
- [ ] 刷新页面不出现 404
- [ ] AI 聊天功能正常（流式响应）
- [ ] 管理后台登录后能正常访问