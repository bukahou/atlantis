---
title: Pinia 状態管理
description: Vue 公式状態管理ライブラリ Pinia のコア機能とベストプラクティス
order: 2
tags:
  - vue
  - pinia
  - state
  - store
---

# Pinia 状態管理

## Pinia 概要

Pinia は Vue 公式推奨の状態管理ライブラリで、直感的な API と完全な TypeScript サポートを提供します。

```
Pinia の特徴
├── シンプルな API - Composition API 風
├── TypeScript サポート - 完全な型推論
├── モジュール化 - ネストモジュールなし
├── 開発者ツール - Vue DevTools 統合
└── 軽量 - 約 1KB gzip
```

## インストールと設定

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

## Store の定義

### Options API スタイル

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
    // this で他の getter にアクセス
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

### Composition API スタイル

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

## Store の使用

### コンポーネントでの使用

```vue
<script setup lang="ts">
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";

const counterStore = useCounterStore();

// 直接アクセス
console.log(counterStore.count);
console.log(counterStore.doubleCount);

// 分割代入には storeToRefs でリアクティブ性を保持
const { count, doubleCount } = storeToRefs(counterStore);

// actions は直接分割可能
const { increment } = counterStore;
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="counterStore.count++">+1 直接変更</button>
  </div>
</template>
```

### 状態の変更

```typescript
const store = useCounterStore();

// 直接変更
store.count++;

// $patch - バッチ変更
store.$patch({
  count: store.count + 1,
  name: "New Name",
});

// $patch 関数式
store.$patch((state) => {
  state.count++;
  state.items.push({ id: 1, name: "item" });
});

// state 全体を置換
store.$state = { count: 0, name: "Reset" };

// 状態をリセット
store.$reset();
```

## 変更の購読

```typescript
const store = useCounterStore();

// 状態変更を購読
store.$subscribe((mutation, state) => {
  console.log("Type:", mutation.type);
  console.log("Store ID:", mutation.storeId);
  console.log("State:", state);
});

// action を購読
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

## Store 間の連携

```typescript
// stores/cart.ts
import { defineStore } from "pinia";
import { useUserStore } from "./user";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  // 他の store を使用
  const userStore = useUserStore();

  const canCheckout = computed(() => {
    return userStore.isLoggedIn && items.value.length > 0;
  });

  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error("Please login first");
    }
    // チェックアウトロジック
  }

  return { items, canCheckout, checkout };
});
```

## プラグイン

### 永続化プラグイン

```typescript
// plugins/persistedState.ts
import { PiniaPluginContext } from "pinia";

export function persistedState({ store }: PiniaPluginContext) {
  // localStorage から復元
  const storedState = localStorage.getItem(store.$id);
  if (storedState) {
    store.$patch(JSON.parse(storedState));
  }

  // 変更を購読して保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state));
  });
}

// main.ts
const pinia = createPinia();
pinia.use(persistedState);
```

### プロパティの追加

```typescript
// すべての store にプロパティを追加
pinia.use(({ store }) => {
  store.$router = markRaw(router);
});

// 型宣言
declare module "pinia" {
  export interface PiniaCustomProperties {
    $router: Router;
  }
}
```

## テスト

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

## ベストプラクティス

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

  // 3. Actions - 非同期とビジネスロジック
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

  // 4. クリーンアップ関数
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

## まとめ

Pinia 状態管理のポイント：

1. **シンプルな API** - defineStore 定義、Composition または Options
2. **リアクティブ** - state、getters 自動反応
3. **TypeScript** - 完全な型推論
4. **モジュール化** - 独立 store、必要に応じてインポート
5. **プラグインシステム** - 永続化、ログなど拡張
