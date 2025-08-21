@echo off
chcp 65001 >nul
echo.
echo ================================================
echo    Git版本管理初始化脚本
echo ================================================
echo.

REM 检查Git是否已安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git未安装，请先安装Git
    echo 下载地址: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git已安装

REM 检查是否已经是Git仓库
if exist .git (
    echo ⚠️  当前目录已经是Git仓库
    echo.
    echo 当前状态:
    git status --porcelain
    echo.
    echo [1] 查看提交历史
    echo [2] 添加所有文件到暂存区
    echo [3] 提交更改
    echo [4] 退出
    echo.
    set /p choice="请选择操作 (1-4): "
    
    if "%choice%"=="1" (
        echo.
        echo 📋 提交历史:
        git log --oneline -10
        pause
        exit /b 0
    )
    
    if "%choice%"=="2" (
        echo.
        echo 📁 添加所有文件到暂存区...
        git add .
        echo ✅ 文件已添加到暂存区
        git status --short
        pause
        exit /b 0
    )
    
    if "%choice%"=="3" (
        echo.
        set /p message="请输入提交信息: "
        if "%message%"=="" (
            set message=docs: 更新项目文档和版本管理配置
        )
        echo.
        echo 💾 提交更改...
        git add .
        git commit -m "%message%"
        echo ✅ 提交完成
        pause
        exit /b 0
    )
    
    exit /b 0
)

echo.
echo 🔧 初始化Git仓库...

REM 初始化Git仓库
git init

REM 设置默认分支名为main
git branch -M main

echo ✅ Git仓库初始化完成

echo.
echo 📁 添加文件到暂存区...
git add .

echo.
echo 💾 创建初始提交...
git commit -m "feat: 初始化学习质效分析微信小程序项目

- 完成项目基础架构搭建
- 实现用户认证和身份绑定系统
- 添加学习时间记录和管理功能
- 实现数据分析和可视化
- 完成多角色权限管理
- 添加数据导入导出功能
- 完善项目文档和开发规范
- 配置版本管理和发布流程"

echo.
echo ✅ 初始提交完成

echo.
echo 🏷️  创建版本标签...
git tag -a v1.0.0 -m "版本 1.0.0

首个正式版本发布:
- 完整的学习管理功能
- 多维度数据分析
- 完善的权限控制
- 标准化的开发流程"

echo ✅ 版本标签创建完成

echo.
echo ================================================
echo    Git仓库设置完成! 🎉
echo ================================================
echo.
echo 📋 后续操作建议:
echo.
echo 1. 配置远程仓库:
echo    git remote add origin https://github.com/username/repo.git
echo.
echo 2. 推送代码到远程:
echo    git push -u origin main
echo    git push origin --tags
echo.
echo 3. 配置分支保护规则
echo 4. 设置CI/CD流水线
echo 5. 邀请团队成员协作
echo.
echo 💡 小贴士:
echo    - 使用 'git status' 查看状态
echo    - 使用 'git log --oneline' 查看提交历史
echo    - 使用 'git branch' 查看分支
echo.
pause
