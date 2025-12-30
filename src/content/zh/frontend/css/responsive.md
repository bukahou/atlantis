---
title: 响应式设计
description: CSS 响应式布局、媒体查询与移动优先策略
order: 3
tags:
  - css
  - responsive
  - mobile
  - layout
---

# 响应式设计

## 响应式概述

响应式设计让网页能够适应不同设备和屏幕尺寸，提供最佳用户体验。

```
响应式策略
├── 移动优先 - 从小屏幕开始设计
├── 断点系统 - 定义不同尺寸的布局
├── 弹性布局 - Flexbox + Grid
├── 相对单位 - rem, em, %, vw/vh
└── 响应式图片 - srcset, picture
```

## 视口设置

```html
<!-- 必须的 meta 标签 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 禁止缩放 (不推荐) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0,
      maximum-scale=1.0, user-scalable=no">
```

## 媒体查询

### 基本语法

```css
/* 最小宽度 (移动优先) */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

/* 最大宽度 */
@media (max-width: 767px) {
  .sidebar {
    display: none;
  }
}

/* 范围 */
@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    padding: 20px;
  }
}

/* 屏幕方向 */
@media (orientation: landscape) {
  .gallery {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (orientation: portrait) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 常用断点

```css
/* 移动优先断点系统 */

/* 小型手机 */
/* 默认样式 (< 640px) */

/* 大型手机 */
@media (min-width: 640px) { /* sm */ }

/* 平板 */
@media (min-width: 768px) { /* md */ }

/* 小型笔记本 */
@media (min-width: 1024px) { /* lg */ }

/* 桌面 */
@media (min-width: 1280px) { /* xl */ }

/* 大屏幕 */
@media (min-width: 1536px) { /* 2xl */ }
```

### 高级媒体特性

```css
/* 高分辨率屏幕 */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  .logo {
    background-image: url('logo@2x.png');
  }
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
  }
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* 悬停支持 */
@media (hover: hover) {
  .button:hover {
    background-color: #2563eb;
  }
}

/* 触摸设备 */
@media (hover: none) and (pointer: coarse) {
  .button {
    min-height: 44px;  /* 触摸友好 */
  }
}
```

## 弹性布局

### Flexbox 响应式

```css
/* 响应式导航 */
.nav {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .nav {
    flex-direction: row;
    justify-content: space-between;
  }
}

/* 响应式卡片网格 */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 1 1 100%;  /* 移动端满宽 */
}

@media (min-width: 640px) {
  .card {
    flex: 1 1 calc(50% - 8px);  /* 2 列 */
  }
}

@media (min-width: 1024px) {
  .card {
    flex: 1 1 calc(33.333% - 11px);  /* 3 列 */
  }
}
```

### Grid 响应式

```css
/* 自动响应式网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 明确的响应式网格 */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 响应式侧边栏布局 */
.layout {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 280px 1fr;
  }
}
```

## 相对单位

```css
/* rem - 相对于根元素 */
html {
  font-size: 16px;  /* 1rem = 16px */
}

.title {
  font-size: 2rem;  /* 32px */
}

/* 响应式根字体 */
html {
  font-size: 14px;
}

@media (min-width: 768px) {
  html {
    font-size: 16px;
  }
}

/* em - 相对于父元素 */
.component {
  font-size: 1rem;
  padding: 1em;  /* 16px */
}

/* 视口单位 */
.hero {
  height: 100vh;        /* 视口高度 */
  width: 100vw;         /* 视口宽度 */
}

.title {
  font-size: clamp(1.5rem, 5vw, 3rem);  /* 响应式字体 */
}

/* 百分比 */
.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 5%;
}
```

## 响应式图片

```html
<!-- srcset 响应式图片 -->
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w,
          image-800.jpg 800w,
          image-1200.jpg 1200w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  alt="响应式图片"
/>

<!-- picture 元素 -->
<picture>
  <source media="(min-width: 1024px)" srcset="large.jpg">
  <source media="(min-width: 640px)" srcset="medium.jpg">
  <img src="small.jpg" alt="响应式图片">
</picture>

<!-- 艺术指导 -->
<picture>
  <source media="(min-width: 768px)" srcset="landscape.jpg">
  <img src="portrait.jpg" alt="不同裁剪">
</picture>
```

```css
/* CSS 响应式背景 */
.hero {
  background-image: url('bg-mobile.jpg');
  background-size: cover;
}

@media (min-width: 768px) {
  .hero {
    background-image: url('bg-desktop.jpg');
  }
}

/* 图片容器 */
.image-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;  /* 16:9 比例 */
}

.image-container img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## 响应式排版

```css
/* 流体排版 */
.title {
  font-size: clamp(1.5rem, 4vw + 1rem, 3.5rem);
}

.body-text {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem);
  line-height: 1.6;
}

/* 响应式间距 */
.section {
  padding: clamp(2rem, 5vw, 5rem) 0;
}

/* 响应式行高 */
.paragraph {
  line-height: 1.5;
}

@media (min-width: 768px) {
  .paragraph {
    line-height: 1.7;
  }
}
```

## Tailwind 响应式

```html
<!-- 基本响应式 -->
<div class="w-full md:w-1/2 lg:w-1/3">
<div class="flex flex-col md:flex-row">
<div class="hidden lg:block">
<div class="text-sm md:text-base lg:text-lg">

<!-- 响应式网格 -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- 响应式间距 -->
<div class="p-4 md:p-6 lg:p-8">
<div class="space-y-4 md:space-y-6">

<!-- 响应式布局 -->
<aside class="w-full lg:w-64 lg:fixed lg:h-screen">
<main class="lg:ml-64">
```

## 容器查询

```css
/* 容器查询 (现代浏览器) */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}

@container (min-width: 600px) {
  .card-title {
    font-size: 1.5rem;
  }
}
```

## 总结

响应式设计要点：

1. **移动优先** - 从小屏幕开始，逐步增强
2. **断点系统** - 统一的媒体查询断点
3. **弹性布局** - Flexbox + Grid 自适应
4. **相对单位** - rem, vw, clamp()
5. **响应式图片** - srcset, picture 元素
