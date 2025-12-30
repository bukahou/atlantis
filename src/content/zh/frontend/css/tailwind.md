---
title: Tailwind CSS
description: Tailwind CSS 实用类优先框架核心用法
order: 1
tags:
  - css
  - tailwind
  - utility
  - frontend
---

# Tailwind CSS

## Tailwind 概述

Tailwind CSS 是一个实用类优先的 CSS 框架，通过组合原子类快速构建自定义设计。

```
Tailwind 特点
├── 实用类优先 - 直接在 HTML 中应用样式
├── 高度可定制 - 自定义设计系统
├── 响应式设计 - 内置断点前缀
├── 暗色模式 - dark: 变体
└── 零 CSS 产出 - 只打包使用的类
```

## 布局

### Flexbox

```html
<!-- Flex 容器 -->
<div class="flex">                    <!-- display: flex -->
<div class="flex flex-col">           <!-- 垂直方向 -->
<div class="flex flex-row-reverse">   <!-- 水平反向 -->

<!-- 对齐 -->
<div class="flex items-center">       <!-- 垂直居中 -->
<div class="flex justify-center">     <!-- 水平居中 -->
<div class="flex items-center justify-center">  <!-- 完全居中 -->
<div class="flex justify-between">    <!-- 两端对齐 -->
<div class="flex justify-around">     <!-- 均匀分布 -->

<!-- 换行 -->
<div class="flex flex-wrap">          <!-- 允许换行 -->
<div class="flex flex-nowrap">        <!-- 不换行 -->

<!-- 间距 -->
<div class="flex gap-4">              <!-- 统一间距 -->
<div class="flex gap-x-4 gap-y-2">    <!-- 分别设置 -->

<!-- 子项 -->
<div class="flex-1">                  <!-- flex: 1 1 0% -->
<div class="flex-auto">               <!-- flex: 1 1 auto -->
<div class="flex-none">               <!-- flex: none -->
<div class="grow">                    <!-- flex-grow: 1 -->
<div class="shrink-0">                <!-- flex-shrink: 0 -->
```

### Grid

```html
<!-- Grid 容器 -->
<div class="grid grid-cols-3">        <!-- 3 列 -->
<div class="grid grid-cols-12">       <!-- 12 列 -->
<div class="grid grid-rows-4">        <!-- 4 行 -->

<!-- 间距 -->
<div class="grid gap-4">              <!-- 统一间距 -->
<div class="grid gap-x-4 gap-y-2">    <!-- 分别设置 -->

<!-- 子项跨越 -->
<div class="col-span-2">              <!-- 跨 2 列 -->
<div class="col-span-full">           <!-- 跨所有列 -->
<div class="row-span-3">              <!-- 跨 3 行 -->

<!-- 起始位置 -->
<div class="col-start-2 col-end-4">   <!-- 从第 2 列到第 4 列 -->
```

### 容器与间距

```html
<!-- 容器 -->
<div class="container mx-auto">       <!-- 居中容器 -->
<div class="max-w-7xl mx-auto">       <!-- 最大宽度 -->

<!-- Padding -->
<div class="p-4">                     <!-- 四周 1rem -->
<div class="px-4 py-2">               <!-- 水平 1rem，垂直 0.5rem -->
<div class="pt-4 pb-2 pl-3 pr-3">     <!-- 各方向单独设置 -->

<!-- Margin -->
<div class="m-4">                     <!-- 四周 1rem -->
<div class="mx-auto">                 <!-- 水平居中 -->
<div class="mt-4 mb-2">               <!-- 上下 margin -->
<div class="-mt-4">                   <!-- 负 margin -->

<!-- 间距单位 -->
<!-- 0.25rem = 1, 0.5rem = 2, 1rem = 4, 1.5rem = 6, 2rem = 8... -->
```

## 排版

```html
<!-- 字体大小 -->
<p class="text-xs">             <!-- 0.75rem -->
<p class="text-sm">             <!-- 0.875rem -->
<p class="text-base">           <!-- 1rem -->
<p class="text-lg">             <!-- 1.125rem -->
<p class="text-xl">             <!-- 1.25rem -->
<p class="text-2xl">            <!-- 1.5rem -->

<!-- 字体粗细 -->
<p class="font-thin">           <!-- 100 -->
<p class="font-normal">         <!-- 400 -->
<p class="font-medium">         <!-- 500 -->
<p class="font-semibold">       <!-- 600 -->
<p class="font-bold">           <!-- 700 -->

<!-- 行高 -->
<p class="leading-none">        <!-- 1 -->
<p class="leading-tight">       <!-- 1.25 -->
<p class="leading-normal">      <!-- 1.5 -->
<p class="leading-relaxed">     <!-- 1.625 -->

<!-- 文本对齐 -->
<p class="text-left">
<p class="text-center">
<p class="text-right">
<p class="text-justify">

<!-- 文本装饰 -->
<p class="underline">
<p class="line-through">
<p class="no-underline">

<!-- 文本溢出 -->
<p class="truncate">            <!-- 单行截断 -->
<p class="line-clamp-3">        <!-- 多行截断 -->
```

## 颜色

```html
<!-- 文本颜色 -->
<p class="text-gray-500">
<p class="text-blue-600">
<p class="text-red-500">

<!-- 背景颜色 -->
<div class="bg-white">
<div class="bg-gray-100">
<div class="bg-blue-500">

<!-- 透明度 -->
<div class="bg-black/50">       <!-- 50% 透明度 -->
<div class="text-white/75">     <!-- 75% 透明度 -->

<!-- 边框颜色 -->
<div class="border border-gray-300">
<div class="border-2 border-blue-500">

<!-- 渐变 -->
<div class="bg-gradient-to-r from-blue-500 to-purple-500">
<div class="bg-gradient-to-b from-white via-gray-100 to-gray-200">
```

## 边框与圆角

```html
<!-- 边框 -->
<div class="border">            <!-- 1px solid -->
<div class="border-2">          <!-- 2px -->
<div class="border-4">          <!-- 4px -->
<div class="border-t">          <!-- 只有上边框 -->
<div class="border-x">          <!-- 左右边框 -->

<!-- 圆角 -->
<div class="rounded">           <!-- 0.25rem -->
<div class="rounded-md">        <!-- 0.375rem -->
<div class="rounded-lg">        <!-- 0.5rem -->
<div class="rounded-xl">        <!-- 0.75rem -->
<div class="rounded-full">      <!-- 完全圆形 -->
<div class="rounded-t-lg">      <!-- 只有上方圆角 -->

<!-- 阴影 -->
<div class="shadow">
<div class="shadow-md">
<div class="shadow-lg">
<div class="shadow-xl">
<div class="shadow-2xl">
```

## 响应式设计

```html
<!-- 断点 -->
<!-- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px -->

<!-- 响应式类 -->
<div class="w-full md:w-1/2 lg:w-1/3">
<div class="flex flex-col md:flex-row">
<div class="hidden md:block">
<div class="text-sm md:text-base lg:text-lg">
<div class="p-4 md:p-6 lg:p-8">

<!-- 移动优先 -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

## 状态变体

```html
<!-- Hover -->
<button class="bg-blue-500 hover:bg-blue-600">

<!-- Focus -->
<input class="border focus:border-blue-500 focus:ring-2">

<!-- Active -->
<button class="bg-blue-500 active:bg-blue-700">

<!-- Disabled -->
<button class="disabled:opacity-50 disabled:cursor-not-allowed">

<!-- Group hover -->
<div class="group">
  <div class="group-hover:text-blue-500">
</div>

<!-- 第一个/最后一个 -->
<li class="first:pt-0 last:pb-0">

<!-- 奇偶行 -->
<tr class="odd:bg-gray-50 even:bg-white">
```

## 暗色模式

```html
<!-- 暗色模式 -->
<div class="bg-white dark:bg-gray-800">
<p class="text-gray-900 dark:text-white">
<div class="border-gray-200 dark:border-gray-700">

<!-- 配置 (tailwind.config.js) -->
module.exports = {
  darkMode: 'class', // 或 'media'
}
```

## 自定义配置

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
      spacing: {
        "128": "32rem",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
```

## 常用组件模式

```html
<!-- 按钮 -->
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg
               hover:bg-blue-600 focus:ring-2 focus:ring-blue-500
               focus:ring-offset-2 transition-colors">
  Button
</button>

<!-- 卡片 -->
<div class="bg-white rounded-xl shadow-lg p-6
            dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
  <p class="mt-2 text-gray-600 dark:text-gray-300">Content</p>
</div>

<!-- 输入框 -->
<input class="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500
              dark:bg-gray-800 dark:border-gray-600" />
```

## 总结

Tailwind CSS 要点：

1. **实用类优先** - 直接应用原子类
2. **响应式** - 断点前缀 sm/md/lg/xl
3. **状态变体** - hover/focus/active 等
4. **暗色模式** - dark: 前缀
5. **可定制** - tailwind.config.js 扩展
