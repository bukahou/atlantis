---
title: Vue
description: Vue 3 响应式系统、Composition API 与生态工具
keyPoints:
  - 响应式原理与 Proxy
  - Composition API 组合式开发
  - Pinia 状态管理
  - Vue Router 路由系统
relatedTopics:
  - TypeScript 集成
  - Vite 构建工具
  - Nuxt 全栈框架
---

# Vue 知识体系

## 核心概念

Vue 是一款渐进式 JavaScript 框架，以其易用性和灵活性著称，Vue 3 引入了 Composition API。

### 核心特性

```
Vue 3 核心特性
┌─────────────────────────────────────────┐
│  响应式系统   │  Proxy 实现，性能更好   │
├──────────────┼──────────────────────────┤
│  Composition │  逻辑复用，更好组织代码 │
│  API         │                          │
├──────────────┼──────────────────────────┤
│  更小体积    │  Tree-shaking 友好       │
├──────────────┼──────────────────────────┤
│  TypeScript  │  原生支持，类型推导      │
└──────────────┴──────────────────────────┘

Options API  vs  Composition API
┌──────────────┐    ┌──────────────┐
│ data()       │    │ ref()        │
│ methods      │ →  │ reactive()   │
│ computed     │    │ computed()   │
│ watch        │    │ watch()      │
│ mounted()    │    │ onMounted()  │
└──────────────┘    └──────────────┘
按选项组织          按功能组织
```

## 学习路径

### 1. 基础概念

- **模板语法** - 插值、指令、事件
- **响应式基础** - ref, reactive
- **组件通信** - props, emit, provide/inject

### 2. Composition API

- **setup 函数** - 组件入口
- **响应式 API** - ref, reactive, toRefs
- **生命周期** - onMounted, onUnmounted
- **组合函数** - 逻辑复用

### 3. 生态工具

- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Vite** - 构建工具
- **Nuxt** - 全栈框架

## 关键技能

| 技能领域 | 核心内容 | 应用场景 |
|---------|---------|---------|
| 响应式 | ref、computed、watch | 状态管理 |
| 组件化 | props、slots、emit | UI 构建 |
| 路由 | 动态路由、导航守卫 | 页面导航 |
| 状态管理 | Pinia、Vuex | 复杂状态 |

## 最佳实践

1. **Composition API** - 优先使用组合式 API
2. **类型安全** - 配合 TypeScript 使用
3. **组合函数** - 提取复用逻辑
4. **性能优化** - v-memo、虚拟滚动
