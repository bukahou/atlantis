---
title: レスポンシブデザイン
description: CSS レスポンシブレイアウト、メディアクエリとモバイルファースト戦略
order: 3
tags:
  - css
  - responsive
  - mobile
  - layout
---

# レスポンシブデザイン

## レスポンシブ概要

レスポンシブデザインは、異なるデバイスと画面サイズに適応し、最適なユーザー体験を提供します。

```
レスポンシブ戦略
├── モバイルファースト - 小画面から設計開始
├── ブレークポイントシステム - 異なるサイズのレイアウト定義
├── フレキシブルレイアウト - Flexbox + Grid
├── 相対単位 - rem, em, %, vw/vh
└── レスポンシブ画像 - srcset, picture
```

## ビューポート設定

```html
<!-- 必須の meta タグ -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- ズーム無効化 (非推奨) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0,
      maximum-scale=1.0, user-scalable=no">
```

## メディアクエリ

### 基本構文

```css
/* 最小幅 (モバイルファースト) */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

/* 最大幅 */
@media (max-width: 767px) {
  .sidebar {
    display: none;
  }
}

/* 範囲 */
@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    padding: 20px;
  }
}

/* 画面の向き */
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

### よく使うブレークポイント

```css
/* モバイルファーストブレークポイントシステム */

/* 小型スマートフォン */
/* デフォルトスタイル (< 640px) */

/* 大型スマートフォン */
@media (min-width: 640px) { /* sm */ }

/* タブレット */
@media (min-width: 768px) { /* md */ }

/* 小型ノートPC */
@media (min-width: 1024px) { /* lg */ }

/* デスクトップ */
@media (min-width: 1280px) { /* xl */ }

/* 大画面 */
@media (min-width: 1536px) { /* 2xl */ }
```

### 高度なメディア特性

```css
/* 高解像度画面 */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) {
  .logo {
    background-image: url('logo@2x.png');
  }
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
  }
}

/* アニメーション軽減 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* ホバーサポート */
@media (hover: hover) {
  .button:hover {
    background-color: #2563eb;
  }
}

/* タッチデバイス */
@media (hover: none) and (pointer: coarse) {
  .button {
    min-height: 44px;  /* タッチフレンドリー */
  }
}
```

## フレキシブルレイアウト

### Flexbox レスポンシブ

```css
/* レスポンシブナビゲーション */
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

/* レスポンシブカードグリッド */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 1 1 100%;  /* モバイルで全幅 */
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

### Grid レスポンシブ

```css
/* 自動レスポンシブグリッド */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 明示的なレスポンシブグリッド */
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

/* レスポンシブサイドバーレイアウト */
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

## 相対単位

```css
/* rem - ルート要素に対して相対 */
html {
  font-size: 16px;  /* 1rem = 16px */
}

.title {
  font-size: 2rem;  /* 32px */
}

/* レスポンシブルートフォント */
html {
  font-size: 14px;
}

@media (min-width: 768px) {
  html {
    font-size: 16px;
  }
}

/* em - 親要素に対して相対 */
.component {
  font-size: 1rem;
  padding: 1em;  /* 16px */
}

/* ビューポート単位 */
.hero {
  height: 100vh;        /* ビューポート高さ */
  width: 100vw;         /* ビューポート幅 */
}

.title {
  font-size: clamp(1.5rem, 5vw, 3rem);  /* レスポンシブフォント */
}

/* パーセンテージ */
.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 5%;
}
```

## レスポンシブ画像

```html
<!-- srcset レスポンシブ画像 -->
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w,
          image-800.jpg 800w,
          image-1200.jpg 1200w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  alt="レスポンシブ画像"
/>

<!-- picture 要素 -->
<picture>
  <source media="(min-width: 1024px)" srcset="large.jpg">
  <source media="(min-width: 640px)" srcset="medium.jpg">
  <img src="small.jpg" alt="レスポンシブ画像">
</picture>

<!-- アートディレクション -->
<picture>
  <source media="(min-width: 768px)" srcset="landscape.jpg">
  <img src="portrait.jpg" alt="異なるクロップ">
</picture>
```

```css
/* CSS レスポンシブ背景 */
.hero {
  background-image: url('bg-mobile.jpg');
  background-size: cover;
}

@media (min-width: 768px) {
  .hero {
    background-image: url('bg-desktop.jpg');
  }
}

/* 画像コンテナ */
.image-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;  /* 16:9 比率 */
}

.image-container img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## レスポンシブタイポグラフィ

```css
/* フルイドタイポグラフィ */
.title {
  font-size: clamp(1.5rem, 4vw + 1rem, 3.5rem);
}

.body-text {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.25rem);
  line-height: 1.6;
}

/* レスポンシブスペーシング */
.section {
  padding: clamp(2rem, 5vw, 5rem) 0;
}

/* レスポンシブ行高 */
.paragraph {
  line-height: 1.5;
}

@media (min-width: 768px) {
  .paragraph {
    line-height: 1.7;
  }
}
```

## Tailwind レスポンシブ

```html
<!-- 基本レスポンシブ -->
<div class="w-full md:w-1/2 lg:w-1/3">
<div class="flex flex-col md:flex-row">
<div class="hidden lg:block">
<div class="text-sm md:text-base lg:text-lg">

<!-- レスポンシブグリッド -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- レスポンシブスペーシング -->
<div class="p-4 md:p-6 lg:p-8">
<div class="space-y-4 md:space-y-6">

<!-- レスポンシブレイアウト -->
<aside class="w-full lg:w-64 lg:fixed lg:h-screen">
<main class="lg:ml-64">
```

## コンテナクエリ

```css
/* コンテナクエリ (モダンブラウザ) */
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

## まとめ

レスポンシブデザインのポイント：

1. **モバイルファースト** - 小画面から始めて段階的に拡張
2. **ブレークポイントシステム** - 統一されたメディアクエリ
3. **フレキシブルレイアウト** - Flexbox + Grid 自動適応
4. **相対単位** - rem, vw, clamp()
5. **レスポンシブ画像** - srcset, picture 要素
