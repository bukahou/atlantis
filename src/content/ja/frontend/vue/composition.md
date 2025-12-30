---
title: Vue Composition API
description: Vue 3 Composition API コア概念とリアクティブシステム
order: 1
tags:
  - vue
  - composition
  - frontend
  - reactive
---

# Vue Composition API

## Composition API 概要

Vue 3 の Composition API は、コンポーネントロジックを整理するより柔軟な方法を提供し、ロジックの再利用とコード構成を容易にします。

```
Composition API コア
├── ref / reactive - リアクティブデータ
├── computed - 算出プロパティ
├── watch / watchEffect - ウォッチャー
├── ライフサイクルフック - onMounted など
└── 依存性注入 - provide / inject
```

## リアクティブ基礎

### ref

```vue
<script setup lang="ts">
import { ref } from "vue";

// プリミティブ型
const count = ref(0);
const name = ref("Vue");

// アクセスと変更
console.log(count.value);
count.value++;

// 型推論
const message = ref("Hello");  // Ref<string>

// 明示的な型
const user = ref<User | null>(null);
</script>

<template>
  <!-- テンプレートで自動アンラップ -->
  <div>{{ count }}</div>
  <button @click="count++">+1</button>
</template>
```

### reactive

```vue
<script setup lang="ts">
import { reactive } from "vue";

// オブジェクトのリアクティブ化
const state = reactive({
  count: 0,
  user: {
    name: "Alice",
    age: 30,
  },
  items: [] as string[],
});

// 直接変更
state.count++;
state.user.name = "Bob";
state.items.push("item");

// 型定義
interface State {
  count: number;
  user: User;
  items: string[];
}

const typedState = reactive<State>({
  count: 0,
  user: { name: "", age: 0 },
  items: [],
});
</script>
```

### ref vs reactive

```vue
<script setup lang="ts">
import { ref, reactive, toRefs } from "vue";

// ref - プリミティブ型向け、.value が必要
const count = ref(0);
count.value++;

// reactive - オブジェクト向け、.value 不要
const state = reactive({ count: 0 });
state.count++;

// toRefs - リアクティブオブジェクトの分割
const { count: countRef } = toRefs(state);

// shallowRef - 浅いリアクティブ
const shallowState = shallowRef({ nested: { value: 1 } });
// shallowState.value の置換のみ更新をトリガー
</script>
```

## 算出プロパティ

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const firstName = ref("John");
const lastName = ref("Doe");

// 読み取り専用算出プロパティ
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});

// 書き込み可能算出プロパティ
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`;
  },
  set(newValue: string) {
    const parts = newValue.split(" ");
    firstName.value = parts[0];
    lastName.value = parts[1] || "";
  },
});

fullNameWritable.value = "Jane Smith";
</script>
```

## ウォッチャー

### watch

```vue
<script setup lang="ts">
import { ref, watch } from "vue";

const count = ref(0);
const user = ref({ name: "Alice", age: 30 });

// 単一の ref を監視
watch(count, (newValue, oldValue) => {
  console.log(`Count: ${oldValue} -> ${newValue}`);
});

// 複数のソースを監視
watch([count, () => user.value.name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`Count: ${oldCount} -> ${newCount}`);
  console.log(`Name: ${oldName} -> ${newName}`);
});

// 深い監視
watch(
  user,
  (newValue) => {
    console.log("User changed:", newValue);
  },
  { deep: true }
);

// 即時実行
watch(
  count,
  (value) => {
    console.log("Count:", value);
  },
  { immediate: true }
);

// 一回限り
watch(
  count,
  () => {
    console.log("Triggered once");
  },
  { once: true }
);
</script>
```

### watchEffect

```vue
<script setup lang="ts">
import { ref, watchEffect } from "vue";

const count = ref(0);
const name = ref("Vue");

// 自動的に依存関係を追跡
watchEffect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`);
});

// 副作用のクリーンアップ
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    count.value++;
  }, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });
});

// 監視を停止
const stop = watchEffect(() => {
  console.log(count.value);
});

stop();  // 停止

// フラッシュタイミング
watchEffect(
  () => {
    // DOM 更新後に実行
  },
  { flush: "post" }
);
</script>
```

## ライフサイクル

```vue
<script setup lang="ts">
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
} from "vue";

onBeforeMount(() => {
  console.log("Before mount");
});

onMounted(() => {
  console.log("Mounted");
  // DOM にアクセス
});

onBeforeUpdate(() => {
  console.log("Before update");
});

onUpdated(() => {
  console.log("Updated");
});

onBeforeUnmount(() => {
  console.log("Before unmount");
});

onUnmounted(() => {
  console.log("Unmounted");
  // クリーンアップ
});

onErrorCaptured((error, instance, info) => {
  console.error("Error captured:", error);
  return false;  // エラーの伝播を防ぐ
});
</script>
```

## テンプレート参照

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";

// DOM 参照
const inputRef = ref<HTMLInputElement | null>(null);

// コンポーネント参照
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null);

onMounted(() => {
  inputRef.value?.focus();
  childRef.value?.someMethod();
});
</script>

<template>
  <input ref="inputRef" />
  <ChildComponent ref="childRef" />
</template>
```

## 依存性注入

```vue
<!-- 親コンポーネント -->
<script setup lang="ts">
import { provide, ref } from "vue";

const theme = ref("dark");
const updateTheme = (newTheme: string) => {
  theme.value = newTheme;
};

// リアクティブデータを提供
provide("theme", theme);
provide("updateTheme", updateTheme);

// Symbol をキーとして使用
const ThemeSymbol = Symbol("theme");
provide(ThemeSymbol, { theme, updateTheme });
</script>

<!-- 子コンポーネント -->
<script setup lang="ts">
import { inject, type Ref } from "vue";

// データを注入
const theme = inject<Ref<string>>("theme");
const updateTheme = inject<(theme: string) => void>("updateTheme");

// デフォルト値
const theme2 = inject("theme", ref("light"));

// Symbol を使用
const ThemeSymbol = Symbol("theme");
const themeContext = inject(ThemeSymbol);
</script>
```

## コンポーザブル (Composables)

```typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from "vue";

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(event: MouseEvent) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => window.addEventListener("mousemove", update));
  onUnmounted(() => window.removeEventListener("mousemove", update));

  return { x, y };
}

// composables/useFetch.ts
import { ref, watchEffect } from "vue";

export function useFetch<T>(url: string) {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(true);

  watchEffect(async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url);
      data.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error("Unknown error");
    } finally {
      loading.value = false;
    }
  });

  return { data, error, loading };
}
```

```vue
<!-- コンポーザブルの使用 -->
<script setup lang="ts">
import { useMouse } from "@/composables/useMouse";
import { useFetch } from "@/composables/useFetch";

const { x, y } = useMouse();
const { data, loading, error } = useFetch<User[]>("/api/users");
</script>

<template>
  <div>Mouse: {{ x }}, {{ y }}</div>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <ul v-else>
    <li v-for="user in data" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

## まとめ

Vue Composition API のポイント：

1. **ref/reactive** - リアクティブデータの作成
2. **computed** - 算出プロパティ、自動キャッシュ
3. **watch/watchEffect** - リアクティブ監視
4. **ライフサイクルフック** - onMounted など
5. **Composables** - ロジック再利用のベストプラクティス
