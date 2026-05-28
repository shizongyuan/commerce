@echo off
cd /d %~dp0
if exist out rmdir /s /q out
if exist admin-out rmdir /s /q admin-out
call npm run build:website
if exist out move out website-out
echo 构建完成，输出目录：website-out