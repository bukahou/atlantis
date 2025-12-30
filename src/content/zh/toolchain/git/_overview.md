---
title: Git 版本控制
description: Git 工作流、分支策略与团队协作规范
keyPoints:
  - Git 核心概念与命令
  - 分支策略与工作流
  - 代码审查流程
  - 冲突解决技巧
relatedTopics:
  - CI/CD 流水线
  - 团队协作
  - DevOps 实践
---

# Git 版本控制知识体系

## 核心概念

Git 是分布式版本控制系统，是现代软件开发的基础工具。

### Git 数据模型

```
Git 对象模型
┌─────────────────────────────────────────┐
│  Commit    │  提交，指向 Tree 和父提交  │
├────────────┼────────────────────────────┤
│  Tree      │  目录结构，包含 Blob/Tree  │
├────────────┼────────────────────────────┤
│  Blob      │  文件内容，二进制数据      │
├────────────┼────────────────────────────┤
│  Tag       │  标签，指向特定 Commit     │
└────────────┴────────────────────────────┘

工作区域
┌──────────┐  add   ┌──────────┐ commit ┌──────────┐
│ Working  │ ────→  │ Staging  │ ────→  │  Local   │
│ Directory│        │  Area    │        │  Repo    │
└──────────┘        └──────────┘        └──────────┘
                                              │
                                              │ push
                                              ▼
                                        ┌──────────┐
                                        │  Remote  │
                                        │  Repo    │
                                        └──────────┘
```

## 学习路径

### 1. 基础操作

- **初始化** - init, clone
- **日常操作** - add, commit, push, pull
- **查看历史** - log, diff, show

### 2. 分支管理

- **分支操作** - branch, checkout, merge
- **远程分支** - fetch, push, track
- **变基** - rebase, cherry-pick

### 3. 工作流

- **Git Flow** - feature/release/hotfix
- **GitHub Flow** - 简化工作流
- **Trunk Based** - 主干开发

## 分支策略

| 策略 | 特点 | 适用场景 |
|-----|------|---------|
| Git Flow | 分支完整 | 版本发布项目 |
| GitHub Flow | 简单 | 持续部署 |
| Trunk Based | 主干开发 | 高频发布 |

## 最佳实践

1. **提交规范** - Conventional Commits
2. **小步提交** - 原子化提交
3. **代码审查** - PR/MR 流程
4. **保护分支** - 主分支保护规则
