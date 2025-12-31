# Atlantis

运维与开发知识体系构建平台，支持中日双语切换。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **图标**: Lucide React
- **部署**: 静态导出 (Static Export)

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

访问 http://localhost:3000

## 项目结构

```
Atlantis/
│
├── docs/                    # 项目文档
│   └── DEVELOPMENT.md       # 开发规范
│
├── scripts/                 # 构建脚本
│   └── build-content.mjs    # 内容处理脚本
│
├── public/                  # 静态资源 (可直接访问)
│   └── content/             # [自动生成] 内容 JSON 文件
│       ├── zh/              # 中文内容
│       └── ja/              # 日文内容
│
├── src/                     # 源代码
│   │
│   ├── app/                 # Next.js 页面路由
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   └── [category]/      # 动态内容路由
│   │
│   ├── components/          # React 组件
│   │   ├── layout/          # 布局组件 (Layout)
│   │   ├── navigation/      # 导航组件 (Navbar, LanguageSwitcher)
│   │   └── content/         # 内容展示组件 (ArticleContent, Sidebar)
│   │
│   ├── content/             # Markdown 内容源文件
│   │   ├── zh/              # 中文文章
│   │   │   └── {category}/{subcategory}/{slug}.md
│   │   └── ja/              # 日文文章
│   │       └── {category}/{subcategory}/{slug}.md
│   │
│   ├── i18n/                # 国际化配置
│   │   ├── context.tsx      # 语言状态 Context
│   │   ├── index.ts         # 配置导出
│   │   └── locales/         # UI 翻译
│   │       ├── zh.ts        # 中文 UI
│   │       └── ja.ts        # 日文 UI
│   │
│   ├── lib/                 # 工具函数库
│   │   └── content.ts       # 内容处理工具
│   │
│   ├── styles/              # 样式文件
│   │   └── globals.css      # 全局样式
│   │
│   └── types/               # TypeScript 类型定义
│       ├── i18n.ts          # 国际化类型
│       └── content.ts       # 内容类型
│
├── .next/                   # [自动生成] Next.js 构建缓存
├── node_modules/            # [自动生成] 依赖包
├── out/                     # [自动生成] 静态导出输出
│
├── package.json             # 项目配置与依赖
├── tsconfig.json            # TypeScript 配置
├── next.config.ts           # Next.js 配置
├── postcss.config.mjs       # PostCSS 配置
└── README.md                # 项目说明 (本文件)
```

## 目录详解

### `src/content/` - 知识内容

这是编写知识文章的核心目录。内容使用 **JSON 格式**存储，支持灵活的 UI 组件渲染。

```
content/
├── zh/                              # 中文
│   └── infrastructure/              # 一级分类
│       └── linux/                   # 二级分类
│           ├── _overview.json       # 分类概览
│           └── shell.json           # 文章
└── ja/                              # 日文 (结构相同)
```

**文章格式 (JSON):**

```json
{
  "meta": {
    "title": "文章标题",
    "description": "简短描述",
    "order": 1,
    "tags": ["tag1", "tag2"]
  },
  "sections": [
    {
      "type": "keyPoints",
      "title": "核心要点",
      "items": ["要点1", "要点2"]
    },
    {
      "type": "text",
      "title": "概述",
      "content": "正文内容..."
    }
  ],
  "relatedTopics": ["相关主题"]
}
```

**支持的 Section 类型:** keyPoints, text, cards, comparison, flow, table, list, codeBlock

### `src/components/` - 组件库

按功能模块化组织：

| 目录 | 用途 | 主要组件 |
|------|------|----------|
| `layout/` | 页面布局 | Layout |
| `navigation/` | 导航功能 | Navbar, NavDropdown, LanguageSwitcher |
| `content/` | 内容展示 | ArticleContent, ContentSidebar |

### `src/i18n/` - 国际化

**双层架构:**

| 层级 | 位置 | 管理内容 |
|------|------|----------|
| UI 层 | `i18n/locales/` | 导航标签、按钮文字、提示信息 |
| 内容层 | `content/{locale}/` | 知识文章、教程、代码示例 |

### `scripts/` - 构建脚本

`build-content.mjs` 在每次构建时自动执行：

1. 扫描 `src/content/` 中的 Markdown 文件
2. 解析 frontmatter 和内容
3. 转换为 HTML
4. 输出 JSON 到 `public/content/`

## 开发规范

- 每个代码文件不超过 **400 行**
- 组件使用 **PascalCase** 命名
- 目录使用 **kebab-case** 命名
- 中日文内容需保持 **结构一致**

详见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## 知识分类

| 分类 | 路径 | 内容 |
|------|------|------|
| 基础设施 | `infrastructure/` | 网络、Linux、云服务 |
| 容器化 | `container/` | Docker、Kubernetes、服务网格 |
| 编程语言 | `languages/` | Python、Go、Rust、TypeScript |
| 前端 | `frontend/` | React、Vue、CSS |
| 后端 | `backend/` | API 设计、微服务、消息队列 |
| 数据库 | `database/` | 关系型、NoSQL、数据建模 |
| 工具链 | `toolchain/` | Git、CI/CD、监控 |

## 添加新内容

1. 在 `src/content/zh/{category}/{subcategory}/` 创建 `.json` 文件
2. 在 `src/content/ja/{category}/{subcategory}/` 创建对应日文版本
3. 运行 `npm run dev` 启动开发服务器
4. 访问 `/{category}/{subcategory}/{slug}` 查看

## AI 开发上下文

详见 [CLAUDE.md](CLAUDE.md) - 包含日语化进度和翻译工作流说明。
