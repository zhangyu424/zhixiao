@echo off
chcp 65001 >nul
echo.
echo ================================================
echo    学习质效分析微信小程序 - 开发助手
echo ================================================
echo.
echo 🚀 启动说明：
echo.
echo 1. 确保已安装微信开发者工具
echo 2. 打开微信开发者工具
echo 3. 选择"导入项目"
echo 4. 选择当前目录: %~dp0
echo 5. 输入 AppID 或选择"测试号"
echo 6. 开始开发调试
echo.
echo ================================================
echo.
echo 📁 项目目录: %~dp0
echo 📱 项目类型: 微信小程序
echo 🛠️  开发工具: 微信开发者工具
echo.
echo ================================================
echo.
echo 🔧 常用功能：
echo [1] 打开项目目录
echo [2] 查看项目信息
echo [3] 退出
echo.
set /p choice="请选择 (1-3): "

if "%choice%"=="1" (
    echo.
    echo 正在打开项目目录...
    explorer "%~dp0"
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo 📋 项目信息：
    echo    名称: 学习质效分析小程序
    echo    版本: 1.0.0
    echo    描述: 学习时间管理和学习效果分析的教育类应用
    echo    主文件: app.js
    echo.
    echo 📄 主要页面：
    echo    - pages/unified-login   (统一登录页面)
    echo    - pages/index/index        (首页)
    echo    - pages/profile/profile    (个人中心)
    echo    - pages/study-report/study-report (学习填报)
    echo    - pages/analysis/analysis  (数据分析)
    echo    - pages/management/management (管理页面)
    echo    - pages/role-switch/role-switch (角色切换)
    echo.
    pause
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo 感谢使用！祝开发愉快！ 🎉
    echo.
    pause
    exit
)

echo.
echo ❌ 无效选择，请重新输入
echo.
goto menu

:menu
echo.
echo 🔧 常用功能：
echo [1] 打开项目目录
echo [2] 查看项目信息
echo [3] 退出
echo.
set /p choice="请选择 (1-3): "
goto :eof
