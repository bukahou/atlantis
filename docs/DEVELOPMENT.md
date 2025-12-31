# Atlantis 开发规范

## 1. 项目概述

Atlantis 是一个纯前端知识库项目，基于 Next.js 构建，支持中日双语切换。

### 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **图标**: Lucide React
- **部署**: 静态导出 (Static Export)

---

## 2. 设计风格指南

### 2.1 视觉设计理念

Atlantis 采用 **现代极简主义** 与 **玻璃拟态 (Glassmorphism)** 相结合的设计风格，强调：

- **清晰层次**: 通过背景模糊和透明度创建视觉深度
- **渐变色彩**: 使用双色渐变为不同分类赋予独特视觉标识
- **平滑过渡**: 所有交互都有流畅的动画反馈
- **暗黑模式**: 完整的深色主题支持，自动跟随系统偏好

### 2.2 色彩系统

#### 全局 CSS 变量

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --sidebar-bg: #f8fafc;
  --border-color: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --sidebar-bg: #1a1a1a;
    --border-color: #2d2d2d;
  }
}
```

#### 分类渐变色映射

每个知识分类使用独特的渐变色，保持视觉一致性：

| 分类 | 渐变色 | Tailwind 类名 |
|------|--------|---------------|
| 基础设施 (infrastructure) | 蓝→青 | `from-blue-500 to-cyan-500` |
| 容器化 (container) | 紫→粉 | `from-purple-500 to-pink-500` |
| 编程语言 (languages) | 橙→黄 | `from-orange-500 to-yellow-500` |
| 前端 (frontend) | 绿→翠 | `from-green-500 to-emerald-500` |
| 后端 (backend) | 靛→紫 | `from-indigo-500 to-purple-500` |
| 数据库 (database) | 红→橙 | `from-red-500 to-orange-500` |
| 工具链 (toolchain) | 灰→石板 | `from-gray-500 to-slate-500` |

使用示例：
```typescript
const categoryColors: Record<string, string> = {
  infrastructure: "from-blue-500 to-cyan-500",
  container: "from-purple-500 to-pink-500",
  // ...
};

// 应用渐变
<div className={`bg-gradient-to-br ${categoryColors[category]}`}>
```

### 2.3 玻璃拟态 (Glassmorphism) 风格

核心特征：半透明背景 + 背景模糊 + 细边框

```typescript
// 导航栏玻璃效果
className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200"

// 卡片玻璃效果
className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200/50"
```

### 2.4 动画与过渡

#### 标准过渡时长

| 类型 | 时长 | Tailwind 类名 |
|------|------|---------------|
| 颜色变化 | 150ms | `transition-colors` |
| 全属性过渡 | 300ms | `transition-all duration-300` |
| 下拉菜单 | 200ms | `transition-all duration-200` |

#### 常用动画效果

```typescript
// Hover 提升效果
"hover:-translate-y-1 hover:shadow-lg transition-all duration-300"

// 图标旋转 (如下拉箭头)
`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`

// 加载骨架屏
"animate-pulse bg-gray-200 dark:bg-gray-700 rounded"

// 渐入效果
"opacity-0 translate-y-2 animate-in fade-in slide-in-from-bottom-2"
```

### 2.5 间距系统

遵循 Tailwind 的 4px 基准间距系统：

| 用途 | 值 | 示例 |
|------|-----|------|
| 组件内小间距 | 2 (8px) | `gap-2`, `p-2` |
| 组件内中间距 | 4 (16px) | `gap-4`, `p-4` |
| 组件间距 | 6 (24px) | `gap-6`, `my-6` |
| 区块间距 | 8 (32px) | `py-8`, `mb-8` |
| 页面边距 | 响应式 | `px-4 sm:px-6 lg:px-8` |

### 2.6 布局规范

#### 最大内容宽度

```typescript
// 主内容区域
className="max-w-7xl mx-auto"  // 1280px

// 文章内容
className="max-w-4xl"  // 896px
```

#### 响应式断点

| 断点 | 宽度 | 用途 |
|------|------|------|
| `sm` | 640px | 移动端横屏 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 桌面端 |
| `xl` | 1280px | 大屏桌面 |

#### Grid 卡片布局

```typescript
// 首页分类卡片
"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

// 文章列表
"grid gap-6 md:grid-cols-2"
```

### 2.7 字体系统

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

#### 代码字体

```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
```

#### 字体大小规范

| 用途 | 类名 | 大小 |
|------|------|------|
| 页面标题 | `text-3xl` / `text-4xl` | 30px / 36px |
| 区块标题 | `text-2xl` | 24px |
| 卡片标题 | `text-lg` / `text-xl` | 18px / 20px |
| 正文 | `text-base` | 16px |
| 辅助文字 | `text-sm` | 14px |
| 标签/徽章 | `text-xs` | 12px |

### 2.8 组件风格示例

#### 按钮样式

```typescript
// 主按钮
"px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg
 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"

// 次要按钮
"px-3 py-1.5 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg
 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
```

#### 卡片样式

```typescript
// 标准卡片
"bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800
 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"

// 渐变边框卡片
"relative rounded-xl overflow-hidden
 before:absolute before:inset-0 before:p-[1px] before:rounded-xl
 before:bg-gradient-to-br before:from-blue-500 before:to-purple-600"
```

#### 输入框样式

```typescript
"w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
```

### 2.9 自定义滚动条

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;  /* 浅色模式 */
  border-radius: 3px;
}

@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-thumb {
    background: #475569;  /* 深色模式 */
  }
}
```

---

## 3. 代码规范

### 3.1 文件行数限制

**每个代码文件禁止超过 400 行**

- 超过 300 行时考虑拆分
- 超过 400 行必须拆分为多个模块

### 3.2 模块化原则

```
✅ 正确做法:
components/
├── navigation/
│   ├── Navbar.tsx        # 导航栏主组件
│   ├── NavDropdown.tsx   # 下拉菜单组件
│   ├── NavItem.tsx       # 单个导航项
│   └── index.ts          # 统一导出

❌ 错误做法:
components/
└── Navbar.tsx            # 所有导航逻辑堆在一个文件
```

### 3.3 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `NavDropdown.tsx` |
| 工具函数 | camelCase | `formatDate.ts` |
| 常量文件 | camelCase | `navConfig.ts` |
| 类型文件 | camelCase | `i18n.ts` |
| 目录名 | kebab-case | `service-mesh/` |

### 3.4 导入顺序

```typescript
// 1. React/Next.js 核心
import { useState, useEffect } from "react";
import Link from "next/link";

// 2. 第三方库
import { Globe, ChevronDown } from "lucide-react";

// 3. 内部模块 (按路径深度排序)
import { useI18n } from "@/i18n/context";
import { NavItem } from "@/types/i18n";

// 4. 相对路径导入
import { SubComponent } from "./SubComponent";
```

---

## 3. 目录结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── [category]/         # 动态分类路由
│       └── [slug]/
│           └── page.tsx
│
├── components/             # React 组件
│   ├── layout/             # 布局组件
│   ├── navigation/         # 导航组件
│   ├── content/            # 内容展示组件
│   └── ui/                 # 通用 UI 组件
│
├── content/                # 知识内容 (JSON 格式)
│   ├── zh/                 # 中文内容
│   │   ├── infrastructure/
│   │   ├── container/
│   │   └── ...
│   └── ja/                 # 日文内容
│       ├── infrastructure/
│       └── ...
│
├── i18n/                   # 国际化
│   ├── context.tsx         # i18n Context
│   ├── index.ts            # 配置导出
│   └── locales/            # UI 翻译文件
│       ├── zh.ts
│       └── ja.ts
│
├── lib/                    # 工具库
│   ├── content.ts          # 内容加载工具
│   └── utils.ts            # 通用工具函数
│
├── styles/                 # 样式文件
│   └── globals.css
│
└── types/                  # TypeScript 类型定义
    ├── i18n.ts
    └── content.ts
```

---

## 4. 国际化 (i18n) 规范

### 4.1 双层国际化架构

```
┌─────────────────────────────────────────────────────────┐
│                    国际化架构                            │
├─────────────────────────────────────────────────────────┤
│  UI 层 (i18n/locales/)                                  │
│  - 导航标签、按钮文字、提示信息                           │
│  - 使用 TypeScript 对象管理                              │
│                                                         │
│  内容层 (content/{locale}/)                              │
│  - 知识文章、教程、代码示例                               │
│  - 使用 Markdown 文件管理                                │
└─────────────────────────────────────────────────────────┘
```

### 4.2 UI 翻译

```typescript
// i18n/locales/zh.ts
export const zh: Translations = {
  common: {
    siteName: "Atlantis 知识库",
    search: "搜索...",
  },
  // ...
};

// i18n/locales/ja.ts
export const ja: Translations = {
  common: {
    siteName: "Atlantis ナレッジベース",
    search: "検索...",
  },
  // ...
};
```

### 4.3 内容文件结构

**注意: 内容已从 Markdown 迁移至 JSON 格式**

```
content/
├── zh/
│   └── infrastructure/
│       └── linux/
│           ├── _overview.json   # 分类概览
│           ├── shell.json       # Shell 脚本教程
│           └── kernel.json      # 内核教程
└── ja/
    └── infrastructure/
        └── linux/
            ├── _overview.json
            ├── shell.json
            └── kernel.json
```

### 4.4 JSON 文件规范

```json
{
  "meta": {
    "title": "Shell スクリプティング",
    "description": "Bash スクリプト構文、変数、条件分岐とループ",
    "order": 7,
    "tags": ["Linux", "Shell", "Bash"]
  },
  "sections": [
    {
      "type": "keyPoints",
      "title": "コアコンセプト",
      "items": [
        "Shell はユーザーと OS の間のインターフェース",
        "Bash は最も広く使われている Shell インタープリタ"
      ]
    },
    {
      "type": "text",
      "title": "概要",
      "content": "Shell スクリプトは一連のコマンドをファイルに保存し..."
    },
    {
      "type": "codeBlock",
      "title": "基本構造",
      "language": "bash",
      "code": "#!/bin/bash\necho \"Hello World\""
    }
  ],
  "relatedTopics": ["Linux システム管理", "CI/CD"]
}
```

### 4.5 Section 类型说明

| Type | 用途 | 必需字段 |
|------|------|----------|
| `keyPoints` | 核心要点 | `title`, `items[]` |
| `text` | 文本段落 | `title`, `content` |
| `cards` | 卡片网格 | `title`, `layout`, `columns`, `items[]` |
| `comparison` | 对比列 | `title`, `columns[]` |
| `flow` | 流程图 | `title`, `direction`, `steps[]` |
| `table` | 表格 | `title`, `headers[]`, `rows[][]` |
| `list` | 列表 | `title`, `style`, `items[]` |
| `codeBlock` | 代码块 | `title`, `language`, `code` |

---

## 5. 组件开发规范

### 5.1 组件结构

```typescript
"use client"; // 仅客户端组件需要

import { useState } from "react";
import { SomeIcon } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface ComponentProps {
  title: string;
  children?: React.ReactNode;
}

export function ComponentName({ title, children }: ComponentProps) {
  const { t } = useI18n();
  const [state, setState] = useState(false);

  return (
    <div className="...">
      {/* 组件内容 */}
    </div>
  );
}
```

### 5.2 组件拆分原则

- **单一职责**: 每个组件只做一件事
- **可复用性**: 提取通用逻辑到独立组件
- **Props 简洁**: 避免传递过多 props，考虑使用 Context

### 5.3 样式规范

使用 Tailwind CSS 类名，避免内联样式：

```tsx
// ✅ 推荐
<div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg">

// ❌ 避免
<div style={{ display: 'flex', alignItems: 'center' }}>
```

---

## 6. 内容编写规范

### 6.1 JSON 文件命名

- 使用 kebab-case: `tcp-ip.json`, `docker-compose.json`
- 文件名即 URL slug: `/infrastructure/network/tcp-ip`
- 分类概览文件统一命名: `_overview.json`

### 6.2 meta 必填字段

```json
{
  "meta": {
    "title": "文章标题",        // 必填
    "description": "简短描述",  // 必填
    "order": 1,                // 可选，用于排序
    "tags": ["tag1", "tag2"]   // 可选，标签数组
  }
}
```

### 6.3 内容对照要求

中日文内容必须保持结构一致：

```
content/zh/container/docker/image.json
content/ja/container/docker/image.json
```

- 相同的文件路径和文件名
- 相同的 sections 数量和类型
- 代码示例保持一致（注释可翻译）
- `slug`、`badge`、`badgeColor`、颜色类名等保持英文不变

---

## 7. Git 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>
```

### Type 类型

| Type | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 重构 |
| content | 内容更新 |
| i18n | 国际化相关 |

### 示例

```
feat(nav): add dropdown menu for categories

content(zh): add Linux shell tutorial

i18n(ja): translate container section
```

---

## 8. 性能优化

### 8.1 静态生成

- 所有页面使用静态生成 (SSG)
- 内容在构建时预渲染

### 8.2 代码分割

- 使用动态导入拆分大型组件
- 按路由自动代码分割

### 8.3 图片优化

- 使用 Next.js Image 组件
- 提供 WebP 格式
- 实现懒加载

---

## 9. 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 本地预览生产版本
npm run start

# 代码检查
npm run lint
```

---

## 10. AI 开发上下文

详细的开发上下文（包括日语化进度、翻译工作流、Section 类型详解）请参阅项目根目录的 [CLAUDE.md](../CLAUDE.md) 文件。

该文件专为 AI 助手提供上下文信息，方便后续 Chat 继续开发工作。
