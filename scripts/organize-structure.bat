@echo off
:: 项目结构整理脚本
:: 自动创建标准目录结构和配置文件

setlocal EnableDelayedExpansion

echo.
echo ========================================
echo    学习质效分析小程序 - 项目结构整理
echo ========================================
echo.

:: 设置颜色
for /f %%a in ('echo prompt $E^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "BLUE=%ESC%[34m"
set "RESET=%ESC%[0m"

echo %BLUE%正在整理项目结构...%RESET%

:: 创建标准目录结构
set "DIRS=pages utils components images docs scripts dev-tools tests config"

for %%d in (%DIRS%) do (
    if not exist "%%d\" (
        mkdir "%%d"
        echo %GREEN%✅ 创建目录: %%d%RESET%
    )
)

:: 创建子目录
if not exist "docs\api\" mkdir "docs\api"
if not exist "docs\guides\" mkdir "docs\guides"
if not exist "images\icons\" mkdir "images\icons"
if not exist "images\backgrounds\" mkdir "images\backgrounds"
if not exist "tests\unit\" mkdir "tests\unit"
if not exist "tests\integration\" mkdir "tests\integration"
if not exist "config\dev\" mkdir "config\dev"
if not exist "config\prod\" mkdir "config\prod"

echo.
echo %GREEN%✅ 项目结构整理完成%RESET%

:: 生成项目结构报告
echo.
echo %BLUE%生成项目结构文档...%RESET%

(
echo # 项目结构说明
echo.
echo ```
echo wu/
echo ├── app.js                    # 全局应用逻辑
echo ├── app.json                  # 全局配置文件
echo ├── app.wxss                  # 全局样式文件
echo ├── package.json              # 项目配置
echo ├── README.md                 # 项目说明
echo ├── version.json              # 版本信息
echo ├── wu.code-workspace         # VS Code工作区配置
echo │
echo ├── pages/                    # 页面目录
echo │   ├── login/                # 登录页面
echo │   ├── index/                # 首页
echo │   ├── profile/              # 个人中心
echo │   ├── study-report/         # 学习填报
echo │   ├── analysis/             # 数据分析
echo │   ├── management/           # 管理页面
echo │   └── role-switch/          # 角色切换
echo │
echo ├── components/               # 自定义组件
echo │   ├── chart/                # 图表组件
echo │   ├── date-picker/          # 日期选择器
echo │   └── data-table/           # 数据表格
echo │
echo ├── utils/                    # 工具函数
echo │   ├── storage-helper.js     # 存储工具
echo │   ├── data-validator.js     # 数据验证工具 (统一)
echo │   ├── permission.js         # 权限管理
echo │   ├── constants.js          # 常量定义
echo │   ├── backend-check.js      # 后端检查
echo │   ├── performance-monitor.js # 性能监控
echo │   ├── error-reporter.js     # 错误报告
echo │   └── data-validator.js     # 数据验证
echo │
echo ├── images/                   # 图片资源
echo │   ├── icons/                # 图标资源
echo │   └── backgrounds/          # 背景图片
echo │
echo ├── docs/                     # 项目文档
echo │   ├── README.md             # 文档索引
echo │   ├── DEVELOPMENT.md        # 开发文档
echo │   ├── API_REQUIREMENTS.md   # API需求文档
echo │   ├── CHANGELOG.md          # 变更日志
echo │   ├── api/                  # API文档
echo │   └── guides/               # 开发指南
echo │
echo ├── scripts/                  # 脚本工具
echo │   ├── api-check.bat/sh      # API状态检查
echo │   ├── quality-check.bat/sh  # 代码质量检查
echo │   └── README.md             # 脚本说明
echo │
echo ├── dev-tools/                # 开发工具
echo │   ├── api-tester/           # API测试工具
echo │   ├── doc-sync/             # 文档同步
echo │   └── USAGE_GUIDE.md        # 使用指南
echo │
echo ├── tests/                    # 测试文件
echo │   ├── unit/                 # 单元测试
echo │   └── integration/          # 集成测试
echo │
echo ├── config/                   # 配置文件
echo │   ├── dev/                  # 开发环境配置
echo │   └── prod/                 # 生产环境配置
echo │
echo ├── .vscode/                  # VS Code配置
echo ├── .github/                  # GitHub配置
echo ├── .eslintrc.json            # ESLint配置
echo ├── .prettierrc.json          # Prettier配置
echo ├── .gitignore                # Git忽略文件
echo │
echo └── zhixiaodocs/              # 后端文档
echo     ├── DEVELOPMENT_PLAN.md   # 开发计划
echo     ├── VERSION_HISTORY.md    # 版本历史
echo     └── INDEX.md              # 文档索引
echo ```
echo.
echo ## 目录说明
echo.
echo - **pages/**: 微信小程序页面，每个子目录包含完整的页面文件
echo - **components/**: 可复用的自定义组件
echo - **utils/**: 工具函数和公共模块
echo - **images/**: 图片和静态资源
echo - **docs/**: 项目文档和说明
echo - **scripts/**: 自动化脚本和工具
echo - **dev-tools/**: 开发辅助工具
echo - **tests/**: 测试文件和用例
echo - **config/**: 环境配置文件
echo.
) > docs\PROJECT_STRUCTURE.md

echo %GREEN%✅ 项目结构文档已生成: docs\PROJECT_STRUCTURE.md%RESET%

echo.
echo ========================================
echo %GREEN%项目结构整理完成！%RESET%
echo ========================================
echo.
