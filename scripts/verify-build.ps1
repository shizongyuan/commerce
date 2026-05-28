$ErrorActionPreference = "Stop"

Write-Host "=== 构建验证脚本 ===" -ForegroundColor Cyan

# 检查官网输出
if (Test-Path "frontend/website-out") {
    Write-Host "✅ 官网构建输出存在: frontend/website-out" -ForegroundColor Green
    $files = Get-ChildItem "frontend/website-out" -Recurse -File | Measure-Object
    Write-Host "   文件数量: $($files.Count)"
} else {
    Write-Host "❌ 官网构建输出不存在: frontend/website-out" -ForegroundColor Red
    exit 1
}

# 检查管理后台输出
if (Test-Path "frontend/admin-out") {
    Write-Host "✅ 管理后台构建输出存在: frontend/admin-out" -ForegroundColor Green
    $files = Get-ChildItem "frontend/admin-out" -Recurse -File | Measure-Object
    Write-Host "   文件数量: $($files.Count)"
} else {
    Write-Host "❌ 管理后台构建输出不存在: frontend/admin-out" -ForegroundColor Red
    exit 1
}

# 检查关键文件
$criticalFiles = @(
    "frontend/website-out/index.html",
    "frontend/website-out/products/index.html",
    "frontend/admin-out/index.html",
    "frontend/admin-out/admin/dashboard/index.html"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file 不存在" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n=== 验证完成 ===" -ForegroundColor Cyan
Write-Host "接下来请参考 docs/DEPLOYMENT-NGINX.md 配置 nginx" -ForegroundColor Yellow