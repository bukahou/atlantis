# Atlantis 开发上下文

此文件为 AI 助手提供项目上下文，方便后续 Chat 继续开发。

## 项目概述

Atlantis 是一个中日双语知识库平台，基于 Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 构建。

**重要变更**: 内容存储已从 Markdown 迁移至 **JSON 格式**，以支持更灵活的 UI 组件渲染。

## 技术架构

```
技术栈:
- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- Lucide React (图标)
- 静态导出部署
```

## 内容系统架构

### JSON 内容结构

```
src/content/
├── zh/                          # 中文内容 (源语言)
│   └── {category}/
│       └── {subcategory}/
│           ├── _overview.json   # 分类概览
│           └── {article}.json   # 具体文章
│
└── ja/                          # 日文内容 (翻译目标)
    └── {category}/
        └── {subcategory}/
            ├── _overview.json
            └── {article}.json
```

### JSON 文件格式

```json
{
  "meta": {
    "title": "文章标题",
    "description": "简短描述",
    "order": 1,
    "tags": ["tag1", "tag2"],
    "icon": "icon-name"           // 仅 _overview.json
  },
  "sections": [
    // Section 类型见下文
  ],
  "relatedTopics": ["Topic1", "Topic2"],
  "articles": [                    // 仅 _overview.json
    {
      "slug": "article-slug",
      "title": "文章标题",
      "description": "描述",
      "priority": "essential|recommended|optional"
    }
  ]
}
```

### Section 类型

| Type | 用途 | 关键字段 |
|------|------|----------|
| `keyPoints` | 核心要点列表 | `title`, `items[]` |
| `text` | 文本段落 | `title`, `content` |
| `cards` | 卡片网格 | `title`, `layout`, `columns`, `items[]` |
| `comparison` | 对比列 | `title`, `columns[]` |
| `flow` | 流程图 | `title`, `subtitle`, `direction`, `steps[]` |
| `table` | 表格 | `title`, `headers[]`, `rows[][]`, `highlightFirst` |
| `list` | 列表 | `title`, `style`, `items[]` |
| `codeBlock` | 代码块 | `title`, `language`, `code` |

## 日语化进度

### 已完成

| 分类 | 子分类 | 文件数 | 状态 |
|------|--------|--------|------|
| infrastructure | container (容器化) | - | 已完成 |
| infrastructure | network (网络) | 8 | 已完成 |
| infrastructure | linux | 8 | 已完成 |
| infrastructure | cloud (云) | 4 | 已完成 |

### Network 文件清单 (ja/infrastructure/network/)

- `_overview.json` - 网络概览，OSI 学习路径
- `osi-model.json` - OSI 七层模型
- `l1-physical.json` - 物理层
- `l2-datalink.json` - 数据链路层
- `l3-network.json` - 网络层
- `l4-transport.json` - 传输层
- `l7-application.json` - 应用层
- `load-balancer.json` - 负载均衡

### Linux 文件清单 (ja/infrastructure/linux/)

- `_overview.json` - Linux 概览
- `kernel.json` - 内核架构
- `process.json` - 进程管理
- `memory.json` - 内存管理
- `storage.json` - 存储系统
- `network.json` - 网络栈
- `service.json` - systemd 服务
- `shell.json` - Shell 脚本

### Cloud 文件清单 (ja/infrastructure/cloud/)

- `_overview.json` - 云平台概览
- `aws.json` - AWS 服务
- `gcp.json` - GCP 服务
- `azure.json` - Azure 服务

### 待翻译

检查 `src/content/zh/` 中是否有其他需要翻译的内容。

## 翻译工作流

1. **读取中文源文件**: `src/content/zh/{category}/{subcategory}/{file}.json`
2. **翻译内容**: 保持 JSON 结构不变，将中文文本翻译为日文
3. **写入日文文件**: `src/content/ja/{category}/{subcategory}/{file}.json`

### 翻译要点

- 保持 JSON 结构完全一致
- 技术术语使用日文惯用表达
- 代码示例中的注释翻译为日文
- `slug`、`badge`、`badgeColor` 等字段保持英文不变
- 渐变色类名 (如 `from-blue-500 to-cyan-500`) 保持不变

### 翻译风格参考

```json
// 中文
"title": "网络基础"
"description": "计算机网络核心概念与协议"

// 日文
"title": "ネットワーク基礎"
"description": "コンピュータネットワークのコアコンセプトとプロトコル"
```

## 目录结构

```
atlantis/
├── src/
│   ├── app/                    # Next.js 页面路由
│   ├── components/             # React 组件
│   │   ├── layout/
│   │   ├── navigation/
│   │   └── content/
│   ├── content/                # JSON 内容源
│   │   ├── zh/                 # 中文
│   │   └── ja/                 # 日文
│   ├── i18n/                   # UI 国际化
│   ├── lib/                    # 工具函数
│   └── types/                  # TypeScript 类型
├── docs/
│   └── DEVELOPMENT.md          # 开发规范
├── README.md
└── CLAUDE.md                   # 本文件
```

## 常用命令

```bash
npm run dev      # 开发模式
npm run build    # 构建
npm run start    # 预览
```

## 注意事项

1. **双语结构**: `zh/` 保存中文，`ja/` 保存日文，两者结构必须一致
2. **不要覆盖中文**: 翻译时只修改 `ja/` 目录下的文件
3. **JSON 格式校验**: 确保 JSON 语法正确，避免尾随逗号
4. **Section 类型**: 严格按照定义的 8 种类型使用

## 后续任务建议

继续翻译 `infrastructure` 之外的其他分类:
- `languages/` - 编程语言
- `frontend/` - 前端开发
- `backend/` - 后端开发
- `database/` - 数据库
- `toolchain/` - 工具链
