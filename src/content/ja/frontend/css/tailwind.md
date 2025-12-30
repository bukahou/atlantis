---
title: Tailwind CSS
description: Tailwind CSS ユーティリティファーストフレームワークのコア機能
order: 1
tags:
  - css
  - tailwind
  - utility
  - frontend
---

# Tailwind CSS

## Tailwind 概要

Tailwind CSS はユーティリティファーストの CSS フレームワークで、アトミッククラスを組み合わせてカスタムデザインを素早く構築できます。

```
Tailwind の特徴
├── ユーティリティファースト - HTML 内で直接スタイル適用
├── 高度にカスタマイズ可能 - 独自のデザインシステム
├── レスポンシブデザイン - 組み込みブレークポイント
├── ダークモード - dark: バリアント
└── ゼロ CSS 出力 - 使用したクラスのみバンドル
```

## レイアウト

### Flexbox

```html
<!-- Flex コンテナ -->
<div class="flex">                    <!-- display: flex -->
<div class="flex flex-col">           <!-- 縦方向 -->
<div class="flex flex-row-reverse">   <!-- 横方向逆順 -->

<!-- 配置 -->
<div class="flex items-center">       <!-- 垂直中央 -->
<div class="flex justify-center">     <!-- 水平中央 -->
<div class="flex items-center justify-center">  <!-- 完全中央 -->
<div class="flex justify-between">    <!-- 両端揃え -->
<div class="flex justify-around">     <!-- 均等配置 -->

<!-- 折り返し -->
<div class="flex flex-wrap">          <!-- 折り返し許可 -->
<div class="flex flex-nowrap">        <!-- 折り返しなし -->

<!-- 間隔 -->
<div class="flex gap-4">              <!-- 統一間隔 -->
<div class="flex gap-x-4 gap-y-2">    <!-- 別々に設定 -->

<!-- 子要素 -->
<div class="flex-1">                  <!-- flex: 1 1 0% -->
<div class="flex-auto">               <!-- flex: 1 1 auto -->
<div class="flex-none">               <!-- flex: none -->
<div class="grow">                    <!-- flex-grow: 1 -->
<div class="shrink-0">                <!-- flex-shrink: 0 -->
```

### Grid

```html
<!-- Grid コンテナ -->
<div class="grid grid-cols-3">        <!-- 3 列 -->
<div class="grid grid-cols-12">       <!-- 12 列 -->
<div class="grid grid-rows-4">        <!-- 4 行 -->

<!-- 間隔 -->
<div class="grid gap-4">              <!-- 統一間隔 -->
<div class="grid gap-x-4 gap-y-2">    <!-- 別々に設定 -->

<!-- 子要素のスパン -->
<div class="col-span-2">              <!-- 2 列スパン -->
<div class="col-span-full">           <!-- 全列スパン -->
<div class="row-span-3">              <!-- 3 行スパン -->

<!-- 開始位置 -->
<div class="col-start-2 col-end-4">   <!-- 2 列目から 4 列目まで -->
```

### コンテナと間隔

```html
<!-- コンテナ -->
<div class="container mx-auto">       <!-- 中央揃えコンテナ -->
<div class="max-w-7xl mx-auto">       <!-- 最大幅 -->

<!-- Padding -->
<div class="p-4">                     <!-- 全方向 1rem -->
<div class="px-4 py-2">               <!-- 水平 1rem、垂直 0.5rem -->
<div class="pt-4 pb-2 pl-3 pr-3">     <!-- 各方向個別設定 -->

<!-- Margin -->
<div class="m-4">                     <!-- 全方向 1rem -->
<div class="mx-auto">                 <!-- 水平中央 -->
<div class="mt-4 mb-2">               <!-- 上下 margin -->
<div class="-mt-4">                   <!-- 負の margin -->

<!-- 間隔単位 -->
<!-- 0.25rem = 1, 0.5rem = 2, 1rem = 4, 1.5rem = 6, 2rem = 8... -->
```

## タイポグラフィ

```html
<!-- フォントサイズ -->
<p class="text-xs">             <!-- 0.75rem -->
<p class="text-sm">             <!-- 0.875rem -->
<p class="text-base">           <!-- 1rem -->
<p class="text-lg">             <!-- 1.125rem -->
<p class="text-xl">             <!-- 1.25rem -->
<p class="text-2xl">            <!-- 1.5rem -->

<!-- フォントウェイト -->
<p class="font-thin">           <!-- 100 -->
<p class="font-normal">         <!-- 400 -->
<p class="font-medium">         <!-- 500 -->
<p class="font-semibold">       <!-- 600 -->
<p class="font-bold">           <!-- 700 -->

<!-- 行の高さ -->
<p class="leading-none">        <!-- 1 -->
<p class="leading-tight">       <!-- 1.25 -->
<p class="leading-normal">      <!-- 1.5 -->
<p class="leading-relaxed">     <!-- 1.625 -->

<!-- テキスト配置 -->
<p class="text-left">
<p class="text-center">
<p class="text-right">
<p class="text-justify">

<!-- テキスト装飾 -->
<p class="underline">
<p class="line-through">
<p class="no-underline">

<!-- テキストオーバーフロー -->
<p class="truncate">            <!-- 1 行切り詰め -->
<p class="line-clamp-3">        <!-- 複数行切り詰め -->
```

## カラー

```html
<!-- テキストカラー -->
<p class="text-gray-500">
<p class="text-blue-600">
<p class="text-red-500">

<!-- 背景カラー -->
<div class="bg-white">
<div class="bg-gray-100">
<div class="bg-blue-500">

<!-- 透明度 -->
<div class="bg-black/50">       <!-- 50% 透明 -->
<div class="text-white/75">     <!-- 75% 透明 -->

<!-- ボーダーカラー -->
<div class="border border-gray-300">
<div class="border-2 border-blue-500">

<!-- グラデーション -->
<div class="bg-gradient-to-r from-blue-500 to-purple-500">
<div class="bg-gradient-to-b from-white via-gray-100 to-gray-200">
```

## ボーダーと角丸

```html
<!-- ボーダー -->
<div class="border">            <!-- 1px solid -->
<div class="border-2">          <!-- 2px -->
<div class="border-4">          <!-- 4px -->
<div class="border-t">          <!-- 上ボーダーのみ -->
<div class="border-x">          <!-- 左右ボーダー -->

<!-- 角丸 -->
<div class="rounded">           <!-- 0.25rem -->
<div class="rounded-md">        <!-- 0.375rem -->
<div class="rounded-lg">        <!-- 0.5rem -->
<div class="rounded-xl">        <!-- 0.75rem -->
<div class="rounded-full">      <!-- 完全な円 -->
<div class="rounded-t-lg">      <!-- 上のみ角丸 -->

<!-- シャドウ -->
<div class="shadow">
<div class="shadow-md">
<div class="shadow-lg">
<div class="shadow-xl">
<div class="shadow-2xl">
```

## レスポンシブデザイン

```html
<!-- ブレークポイント -->
<!-- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px -->

<!-- レスポンシブクラス -->
<div class="w-full md:w-1/2 lg:w-1/3">
<div class="flex flex-col md:flex-row">
<div class="hidden md:block">
<div class="text-sm md:text-base lg:text-lg">
<div class="p-4 md:p-6 lg:p-8">

<!-- モバイルファースト -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

## 状態バリアント

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

<!-- 最初/最後 -->
<li class="first:pt-0 last:pb-0">

<!-- 奇数/偶数行 -->
<tr class="odd:bg-gray-50 even:bg-white">
```

## ダークモード

```html
<!-- ダークモード -->
<div class="bg-white dark:bg-gray-800">
<p class="text-gray-900 dark:text-white">
<div class="border-gray-200 dark:border-gray-700">

<!-- 設定 (tailwind.config.js) -->
module.exports = {
  darkMode: 'class', // または 'media'
}
```

## カスタム設定

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

## よく使うコンポーネントパターン

```html
<!-- ボタン -->
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg
               hover:bg-blue-600 focus:ring-2 focus:ring-blue-500
               focus:ring-offset-2 transition-colors">
  Button
</button>

<!-- カード -->
<div class="bg-white rounded-xl shadow-lg p-6
            dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
  <p class="mt-2 text-gray-600 dark:text-gray-300">Content</p>
</div>

<!-- 入力フィールド -->
<input class="w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500
              dark:bg-gray-800 dark:border-gray-600" />
```

## まとめ

Tailwind CSS のポイント：

1. **ユーティリティファースト** - アトミッククラスを直接適用
2. **レスポンシブ** - ブレークポイント接頭辞 sm/md/lg/xl
3. **状態バリアント** - hover/focus/active など
4. **ダークモード** - dark: 接頭辞
5. **カスタマイズ可能** - tailwind.config.js で拡張
