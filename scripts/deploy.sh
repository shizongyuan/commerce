#!/bin/bash
# 部署脚本 - 完整部署网站、管理后台和静态资源

set -e

echo "=== 1. 构建前端 ==="
cd C:/projeck/work/frontend/website && npm run build
cd C:/projeck/work/frontend/admin && npm run build

echo "=== 2. 部署网站 ==="
rm -rf C:/wwwroot/work.muruai.cn
cp -r C:/projeck/work/frontend/website/out C:/wwwroot/work.muruai.cn

echo "=== 3. 部署管理后台 ==="
mkdir -p C:/wwwroot/work.muruai.cn/admin
cp -r C:/projeck/work/frontend/admin/out/* C:/wwwroot/work.muruai.cn/admin/

echo "=== 4. 复制静态图片 ==="
mkdir -p C:/wwwroot/work.muruai.cn/images/products
cp C:/projeck/work/backend/public/products/*.webp C:/wwwroot/work.muruai.cn/images/products/
cd C:/wwwroot/work.muruai.cn/images/products
# 复制共享图片
cp prod-010.webp prod-013.webp
cp prod-008.webp prod-014.webp
cp prod-011.webp prod-015.webp
cp prod-002.webp prod-016.webp
cp prod-004.webp prod-017.webp
cp prod-005.webp prod-018.webp
cp prod-003.webp prod-019.webp
cp prod-007.webp prod-020.webp

echo "=== 部署完成 ==="
echo "产品图片: $(ls C:/wwwroot/work.muruai.cn/images/products/*.webp | wc -l) 张"
echo "AI员工图片: $(ls C:/wwwroot/work.muruai.cn/images/agents/*.webp | wc -l) 张"