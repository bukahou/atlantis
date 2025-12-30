---
title: CSS アニメーション効果
description: CSS トランジション、アニメーションとインタラクション効果
order: 2
tags:
  - css
  - animation
  - transition
  - frontend
---

# CSS アニメーション効果

## トランジション (Transition)

### 基本トランジション

```css
/* 基本構文 */
.button {
  background-color: #3b82f6;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #2563eb;
}

/* 複数プロパティ */
.card {
  transform: translateY(0);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* すべてのプロパティ */
.element {
  transition: all 0.3s ease;
}
```

### タイミング関数

```css
/* 組み込みタイミング関数 */
.ease { transition-timing-function: ease; }
.ease-in { transition-timing-function: ease-in; }
.ease-out { transition-timing-function: ease-out; }
.ease-in-out { transition-timing-function: ease-in-out; }
.linear { transition-timing-function: linear; }

/* ベジェ曲線 */
.custom {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* よく使うカスタム曲線 */
.smooth { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }
.bounce { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }
```

### Tailwind トランジション

```html
<!-- 基本トランジション -->
<button class="transition-colors duration-300 hover:bg-blue-600">
<div class="transition-transform duration-300 hover:scale-105">
<div class="transition-opacity duration-300 hover:opacity-80">

<!-- すべてのプロパティ -->
<div class="transition-all duration-300">

<!-- タイミング関数 -->
<div class="transition ease-in-out duration-300">
<div class="transition ease-out duration-500">

<!-- 遅延 -->
<div class="transition delay-150 duration-300">
```

## キーフレームアニメーション

### 基本アニメーション

```css
/* キーフレーム定義 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* アニメーション適用 */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.slide-up {
  animation: slideUp 0.6s ease-out forwards;
}
```

### アニメーションプロパティ

```css
.animated {
  animation-name: bounce;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-delay: 0.2s;
  animation-iteration-count: infinite;  /* または具体的な数 */
  animation-direction: alternate;       /* normal, reverse, alternate */
  animation-fill-mode: forwards;        /* none, forwards, backwards, both */
  animation-play-state: running;        /* running, paused */
}

/* 省略形 */
.animated {
  animation: bounce 1s ease-in-out 0.2s infinite alternate forwards;
}
```

### よく使うアニメーション

```css
/* パルス */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* バウンス */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 回転 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* シェイク */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 点滅 */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Tailwind アニメーション

```html
<!-- 組み込みアニメーション -->
<div class="animate-spin">       <!-- 回転 -->
<div class="animate-ping">       <!-- パルス拡散 -->
<div class="animate-pulse">      <!-- パルス -->
<div class="animate-bounce">     <!-- バウンス -->

<!-- カスタムアニメーション (tailwind.config.js) -->
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
}
```

## Transform 変換

```css
/* 移動 */
.translate { transform: translate(10px, 20px); }
.translate-x { transform: translateX(10px); }
.translate-y { transform: translateY(20px); }
.translate-z { transform: translateZ(10px); }

/* 拡大縮小 */
.scale { transform: scale(1.5); }
.scale-x { transform: scaleX(1.5); }
.scale-y { transform: scaleY(0.8); }

/* 回転 */
.rotate { transform: rotate(45deg); }
.rotate-x { transform: rotateX(45deg); }
.rotate-y { transform: rotateY(45deg); }

/* 傾斜 */
.skew { transform: skew(10deg, 5deg); }

/* 組み合わせ */
.combined {
  transform: translateY(-10px) rotate(5deg) scale(1.1);
}

/* 変換原点 */
.origin-center { transform-origin: center; }
.origin-top { transform-origin: top; }
.origin-bottom-right { transform-origin: bottom right; }
```

## インタラクション効果

### ホバー効果

```css
/* スケールホバー */
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* グローホバー */
.hover-glow {
  transition: box-shadow 0.3s ease;
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

/* ボーダーアニメーション */
.hover-border {
  position: relative;
}
.hover-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #3b82f6;
  transition: width 0.3s ease;
}
.hover-border:hover::after {
  width: 100%;
}
```

### ローディングアニメーション

```css
/* スピナー */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ドットローダー */
.dots {
  display: flex;
  gap: 8px;
}
.dots span {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}
.dots span:nth-child(1) { animation-delay: 0s; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

/* スケルトンスクリーン */
.skeleton {
  background: linear-gradient(
    90deg,
    #f3f4f6 25%,
    #e5e7eb 50%,
    #f3f4f6 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 入場アニメーション

```css
/* フェードアップ */
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.6s ease forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* スタガードアニメーション */
.stagger > * {
  opacity: 0;
  animation: fadeUp 0.5s ease forwards;
}
.stagger > *:nth-child(1) { animation-delay: 0.1s; }
.stagger > *:nth-child(2) { animation-delay: 0.2s; }
.stagger > *:nth-child(3) { animation-delay: 0.3s; }
```

## パフォーマンス最適化

```css
/* will-change 使用 */
.optimized {
  will-change: transform, opacity;
}

/* GPU アクセラレーション */
.gpu-accelerated {
  transform: translateZ(0);
  /* または */
  backface-visibility: hidden;
}

/* アニメーションを避けるプロパティ */
/* 推奨: transform, opacity */
/* 避ける: width, height, top, left, margin, padding */
```

## まとめ

CSS アニメーションのポイント：

1. **トランジション** - シンプルな状態変化、transition
2. **キーフレーム** - 複雑なアニメーション、@keyframes
3. **Transform** - 移動、拡大縮小、回転
4. **タイミング関数** - アニメーションの緩急
5. **パフォーマンス** - transform/opacity を優先
