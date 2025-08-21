@echo off
:: 代码质量检查脚本 (Windows版)
:: 用于检查代码格式、语法和质量

setlocal EnableDelayedExpansion

echo.
echo ========================================
echo    学习质效分析小程序 - 代码质量检查
echo ========================================
echo.

:: 检查参数
set "CHECK_TYPE=%~1"
if "%CHECK_TYPE%"=="" set "CHECK_TYPE=all"

:: 设置颜色
:: 绿色 = 成功，红色 = 错误，黄色 = 警告
for /f %%a in ('echo prompt $E^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "RED=%ESC%[31m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "RESET=%ESC%[0m"

:: 检查Node.js环境
echo %BLUE%[1/6]%RESET% 检查Node.js环境...
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%❌ Node.js未安装或不在PATH中%RESET%
    echo    请安装Node.js: https://nodejs.org/
    goto :error
)
echo %GREEN%✅ Node.js环境正常%RESET%

:: 检查npm依赖
echo.
echo %BLUE%[2/6]%RESET% 检查项目依赖...
if not exist "node_modules\" (
    echo %YELLOW%⚠️  依赖未安装，正在安装...%RESET%
    npm install
    if !errorlevel! neq 0 (
        echo %RED%❌ 依赖安装失败%RESET%
        goto :error
    )
)
echo %GREEN%✅ 项目依赖完整%RESET%

:: ESLint代码检查
if "%CHECK_TYPE%"=="all" goto :lint
if "%CHECK_TYPE%"=="lint" goto :lint
if "%CHECK_TYPE%"=="format" goto :format
goto :lint

:lint
echo.
echo %BLUE%[3/6]%RESET% 运行ESLint代码检查...
call npm run lint:check
if !errorlevel! neq 0 (
    echo %RED%❌ ESLint检查发现问题%RESET%
    echo    运行 'npm run lint' 自动修复部分问题
    set "HAS_ERROR=1"
) else (
    echo %GREEN%✅ ESLint检查通过%RESET%
)

:format
echo.
echo %BLUE%[4/6]%RESET% 运行Prettier格式检查...
call npm run format:check
if !errorlevel! neq 0 (
    echo %RED%❌ 代码格式不符合规范%RESET%
    echo    运行 'npm run format' 自动格式化代码
    set "HAS_ERROR=1"
) else (
    echo %GREEN%✅ 代码格式检查通过%RESET%
)

:: 检查重要文件
echo.
echo %BLUE%[5/6]%RESET% 检查必要文件...
set "REQUIRED_FILES=app.js app.json package.json README.md"
for %%f in (%REQUIRED_FILES%) do (
    if not exist "%%f" (
        echo %RED%❌ 缺少重要文件: %%f%RESET%
        set "HAS_ERROR=1"
    )
)

if not defined HAS_ERROR (
    echo %GREEN%✅ 所有必要文件存在%RESET%
)

:: 项目结构检查
echo.
echo %BLUE%[6/6]%RESET% 检查项目结构...
set "REQUIRED_DIRS=pages utils docs scripts"
for %%d in (%REQUIRED_DIRS%) do (
    if not exist "%%d\" (
        echo %RED%❌ 缺少重要目录: %%d%RESET%
        set "HAS_ERROR=1"
    )
)

if not defined HAS_ERROR (
    echo %GREEN%✅ 项目结构正确%RESET%
)

:: 总结
echo.
echo ========================================
if defined HAS_ERROR (
    echo %RED%❌ 质量检查发现问题，请查看上面的错误信息%RESET%
    echo.
    echo 常用修复命令:
    echo   npm run lint          # 自动修复ESLint问题
    echo   npm run format        # 自动格式化代码
    echo   npm run quality-check # 重新运行检查
    goto :error
) else (
    echo %GREEN%✅ 所有质量检查通过！代码质量良好%RESET%
    echo.
    echo 您可以安心提交代码到版本控制系统
)
echo ========================================
echo.
goto :end

:error
echo.
echo %RED%脚本执行失败%RESET%
exit /b 1

:end
echo 质量检查完成
exit /b 0
