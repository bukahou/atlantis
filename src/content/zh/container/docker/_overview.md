---
title: Docker 容器
description: Docker 容器技术核心概念、镜像管理与容器编排
keyPoints:
  - 容器与虚拟机的区别
  - Dockerfile 与镜像构建
  - 容器网络与存储
  - Docker Compose 多容器编排
relatedTopics:
  - Kubernetes 编排
  - 微服务架构
  - CI/CD 流水线
---

# Docker 容器知识体系

## 核心概念

Docker 是最流行的容器化平台，通过容器技术实现应用的快速部署和一致性运行环境。

### 容器 vs 虚拟机

```
虚拟机架构                    容器架构
┌─────┬─────┬─────┐         ┌─────┬─────┬─────┐
│App A│App B│App C│         │App A│App B│App C│
├─────┼─────┼─────┤         ├─────┴─────┴─────┤
│Guest│Guest│Guest│         │  Docker Engine  │
│ OS  │ OS  │ OS  │         ├─────────────────┤
├─────┴─────┴─────┤         │    Host OS      │
│   Hypervisor    │         ├─────────────────┤
├─────────────────┤         │   Hardware      │
│    Host OS      │         └─────────────────┘
├─────────────────┤
│    Hardware     │         ✓ 更轻量
└─────────────────┘         ✓ 启动更快
                            ✓ 资源利用率更高
```

## 学习路径

### 1. 基础操作

- **镜像管理** - pull, build, push, tag
- **容器生命周期** - run, stop, start, rm
- **资源查看** - ps, logs, inspect, stats

### 2. 镜像构建

- **Dockerfile** - 多阶段构建
- **镜像优化** - 层缓存、体积优化
- **镜像仓库** - Registry, Harbor

### 3. 容器编排

- **Docker Compose** - 多容器应用
- **网络模式** - bridge, host, overlay
- **数据持久化** - volumes, bind mounts

## 关键技能

| 技能领域 | 核心内容 | 应用场景 |
|---------|---------|---------|
| 镜像构建 | Dockerfile, 多阶段 | CI/CD |
| 容器调试 | exec, logs, attach | 问题排查 |
| 网络配置 | 网络模式, DNS | 服务通信 |
| 存储管理 | Volume, Mount | 数据持久化 |

## 最佳实践

1. **最小镜像** - 使用 Alpine 或 distroless
2. **非 root 运行** - 提升容器安全性
3. **健康检查** - 配置 HEALTHCHECK
4. **日志管理** - 使用日志驱动收集日志
