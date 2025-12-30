---
title: Pinia 状态管理
description: Vue 官方状态管理库 Pinia 核心用法与最佳实践
order: 2
tags:
  - vue
  - pinia
  - state
  - store
---

# Pinia 状态管理

## Pinia 概述

Pinia 是 Vue 官方推荐的状态管理库，提供直观的 API 和完整的 TypeScript 支持。

```
Pinia 特点
├── 简洁 API - 类似组合式 API
├── TypeScript 支持 - 完整类型推断
├── 模块化 - 无嵌套模块
├── 开发者工具 - Vue DevTools 集成
└── 轻量 - 约 1KB gzip
```

## 安装与配置

```typescript
// main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");
```

## 定义 Store

### Options API 风格

```typescript
// stores/counter.ts
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 0,
    name: "Counter",
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
    // 使用 this 访问其他 getter
    doubleCountPlusOne(): number {
      return this.doubleCount + 1;
    },
  },

  actions: {
    increment() {
      this.count++;
    },
    async fetchData() {
      const data = await api.getData();
      this.count = data.count;
    },
  },
});
```

### Composition API 风格

```typescript
// stores/user.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  // state
  const user = ref<User | null>(null);
  const isLoading = ref(false);

  // getters
  const isLoggedIn = computed(() => !!user.value);
  const userName = computed(() => user.value?.name ?? "Guest");

  // actions
  async function login(credentials: Credentials) {
    isLoading.value = true;
    try {
      user.value = await api.login(credentials);
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
  }

  return {
    user,
    isLoading,
    isLoggedIn,
    userName,
    login,
    logout,
  };
});
```

## 使用 Store

### 在组件中使用

```vue
<script setup lang="ts">
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";

const counterStore = useCounterStore();

// 直接访问
console.log(counterStore.count);
console.log(counterStore.doubleCount);

// 解构需要 storeToRefs 保持响应性
const { count, doubleCount } = storeToRefs(counterStore);

// actions 可以直接解构
const { increment } = counterStore;
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="counterStore.count++">+1 直接修改</button>
  </div>
</template>
```

### 修改状态

```typescript
const store = useCounterStore();

// 直接修改
store.count++;

// $patch - 批量修改
store.$patch({
  count: store.count + 1,
  name: "New Name",
});

// $patch 函数式
store.$patch((state) => {
  state.count++;
  state.items.push({ id: 1, name: "item" });
});

// 替换整个 state
store.$state = { count: 0, name: "Reset" };

// 重置状态
store.$reset();
```

## 订阅变化

```typescript
const store = useCounterStore();

// 订阅状态变化
store.$subscribe((mutation, state) => {
  console.log("Type:", mutation.type);
  console.log("Store ID:", mutation.storeId);
  console.log("State:", state);
});

// 订阅 action
store.$onAction(({ name, store, args, after, onError }) => {
  console.log(`Action ${name} called with`, args);

  after((result) => {
    console.log("Action completed with result:", result);
  });

  onError((error) => {
    console.error("Action failed:", error);
  });
});
```

## Store 之间交互

```typescript
// stores/cart.ts
import { defineStore } from "pinia";
import { useUserStore } from "./user";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  // 使用其他 store
  const userStore = useUserStore();

  const canCheckout = computed(() => {
    return userStore.isLoggedIn && items.value.length > 0;
  });

  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error("Please login first");
    }
    // 结账逻辑
  }

  return { items, canCheckout, checkout };
});
```

## 插件

### 持久化插件

```typescript
// plugins/persistedState.ts
import { PiniaPluginContext } from "pinia";

export function persistedState({ store }: PiniaPluginContext) {
  // 从 localStorage 恢复
  const storedState = localStorage.getItem(store.$id);
  if (storedState) {
    store.$patch(JSON.parse(storedState));
  }

  // 订阅变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state));
  });
}

// main.ts
const pinia = createPinia();
pinia.use(persistedState);
```

### 添加属性

```typescript
// 为所有 store 添加属性
pinia.use(({ store }) => {
  store.$router = markRaw(router);
});

// 类型声明
declare module "pinia" {
  export interface PiniaCustomProperties {
    $router: Router;
  }
}
```

## 测试

```typescript
import { setActivePinia, createPinia } from "pinia";
import { useCounterStore } from "@/stores/counter";
import { describe, it, expect, beforeEach } from "vitest";

describe("Counter Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("increments count", () => {
    const store = useCounterStore();
    expect(store.count).toBe(0);

    store.increment();
    expect(store.count).toBe(1);
  });

  it("computes double count", () => {
    const store = useCounterStore();
    store.count = 5;
    expect(store.doubleCount).toBe(10);
  });
});
```

## 最佳实践

```typescript
// stores/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// stores/user.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "./types";

export const useUserStore = defineStore("user", () => {
  // 1. State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 2. Getters
  const isAuthenticated = computed(() => !!token.value);

  // 3. Actions - 处理异步和业务逻辑
  async function fetchUser() {
    if (!token.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      user.value = await api.getUser();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error";
    } finally {
      isLoading.value = false;
    }
  }

  // 4. 清理函数
  function $reset() {
    user.value = null;
    token.value = null;
    error.value = null;
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    fetchUser,
    $reset,
  };
});
```

## 总结

Pinia 状态管理要点：

1. **简洁 API** - defineStore 定义，组合式或选项式
2. **响应式** - state、getters 自动响应
3. **TypeScript** - 完整类型推断
4. **模块化** - 独立 store，按需导入
5. **插件系统** - 持久化、日志等扩展
