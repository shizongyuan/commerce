@echo off
cd /d %~dp0
if exist admin-out rmdir /s /q admin-out
call npm run build:admin
if exist admin-out echo 构建完成，输出目录：admin-out