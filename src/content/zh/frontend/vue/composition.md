---
title: Vue 组合式 API
description: Vue 3 Composition API 核心概念与响应式系统
order: 1
tags:
  - vue
  - composition
  - frontend
  - reactive
---

# Vue 组合式 API

## 组合式 API 概述

Vue 3 的组合式 API 提供了一种更灵活的方式来组织组件逻辑，便于逻辑复用和代码组织。

```
组合式 API 核心
├── ref / reactive - 响应式数据
├── computed - 计算属性
├── watch / watchEffect - 侦听器
├── 生命周期钩子 - onMounted 等
└── 依赖注入 - provide / inject
```

## 响应式基础

### ref

```vue
<script setup lang="ts">
import { ref } from "vue";

// 基本类型
const count = ref(0);
const name = ref("Vue");

// 访问和修改
console.log(count.value);
count.value++;

// 类型推断
const message = ref("Hello");  // Ref<string>

// 显式类型
const user = ref<User | null>(null);
</script>

<template>
  <!-- 模板中自动解包 -->
  <div>{{ count }}</div>
  <button @click="count++">+1</button>
</template>
```

### reactive

```vue
<script setup lang="ts">
import { reactive } from "vue";

// 对象响应式
const state = reactive({
  count: 0,
  user: {
    name: "Alice",
    age: 30,
  },
  items: [] as string[],
});

// 直接修改
state.count++;
state.user.name = "Bob";
state.items.push("item");

// 类型定义
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

// ref - 适用于基本类型，需要 .value
const count = ref(0);
count.value++;

// reactive - 适用于对象，不需要 .value
const state = reactive({ count: 0 });
state.count++;

// toRefs - 解构响应式对象
const { count: countRef } = toRefs(state);

// shallowRef - 浅层响应
const shallowState = shallowRef({ nested: { value: 1 } });
// 只有 shallowState.value 的替换才会触发更新
</script>
```

## 计算属性

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const firstName = ref("John");
const lastName = ref("Doe");

// 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});

// 可写计算属性
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

## 侦听器

### watch

```vue
<script setup lang="ts">
import { ref, watch } from "vue";

const count = ref(0);
const user = ref({ name: "Alice", age: 30 });

// 监听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`Count: ${oldValue} -> ${newValue}`);
});

// 监听多个源
watch([count, () => user.value.name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`Count: ${oldCount} -> ${newCount}`);
  console.log(`Name: ${oldName} -> ${newName}`);
});

// 深层监听
watch(
  user,
  (newValue) => {
    console.log("User changed:", newValue);
  },
  { deep: true }
);

// 立即执行
watch(
  count,
  (value) => {
    console.log("Count:", value);
  },
  { immediate: true }
);

// 一次性监听
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

// 自动追踪依赖
watchEffect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`);
});

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    count.value++;
  }, 1000);

  onCleanup(() => {
    clearInterval(timer);
  });
});

// 停止侦听
const stop = watchEffect(() => {
  console.log(count.value);
});

stop();  // 停止

// 刷新时机
watchEffect(
  () => {
    // DOM 更新后执行
  },
  { flush: "post" }
);
</script>
```

## 生命周期

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
  // 访问 DOM
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
  // 清理工作
});

onErrorCaptured((error, instance, info) => {
  console.error("Error captured:", error);
  return false;  // 阻止错误向上传播
});
</script>
```

## 模板引用

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";

// DOM 引用
const inputRef = ref<HTMLInputElement | null>(null);

// 组件引用
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

## 依赖注入

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { provide, ref } from "vue";

const theme = ref("dark");
const updateTheme = (newTheme: string) => {
  theme.value = newTheme;
};

// 提供响应式数据
provide("theme", theme);
provide("updateTheme", updateTheme);

// 使用 Symbol 作为 key
const ThemeSymbol = Symbol("theme");
provide(ThemeSymbol, { theme, updateTheme });
</script>

<!-- 子组件 -->
<script setup lang="ts">
import { inject, type Ref } from "vue";

// 注入数据
const theme = inject<Ref<string>>("theme");
const updateTheme = inject<(theme: string) => void>("updateTheme");

// 默认值
const theme2 = inject("theme", ref("light"));

// 使用 Symbol
const ThemeSymbol = Symbol("theme");
const themeContext = inject(ThemeSymbol);
</script>
```

## 组合函数 (Composables)

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
<!-- 使用组合函数 -->
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

## 总结

Vue 组合式 API 要点：

1. **ref/reactive** - 创建响应式数据
2. **computed** - 计算属性，自动缓存
3. **watch/watchEffect** - 响应式侦听
4. **生命周期钩子** - onMounted 等
5. **Composables** - 逻辑复用的最佳实践
