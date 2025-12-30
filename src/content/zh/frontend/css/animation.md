---
title: CSS 动画效果
description: CSS 过渡、动画与交互效果实现
order: 2
tags:
  - css
  - animation
  - transition
  - frontend
---

# CSS 动画效果

## 过渡 (Transition)

### 基本过渡

```css
/* 基本语法 */
.button {
  background-color: #3b82f6;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #2563eb;
}

/* 多属性过渡 */
.card {
  transform: translateY(0);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* 所有属性 */
.element {
  transition: all 0.3s ease;
}
```

### 过渡时间函数

```css
/* 内置时间函数 */
.ease { transition-timing-function: ease; }
.ease-in { transition-timing-function: ease-in; }
.ease-out { transition-timing-function: ease-out; }
.ease-in-out { transition-timing-function: ease-in-out; }
.linear { transition-timing-function: linear; }

/* 贝塞尔曲线 */
.custom {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 常用自定义曲线 */
.smooth { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }
.bounce { transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }
```

### Tailwind 过渡

```html
<!-- 基本过渡 -->
<button class="transition-colors duration-300 hover:bg-blue-600">
<div class="transition-transform duration-300 hover:scale-105">
<div class="transition-opacity duration-300 hover:opacity-80">

<!-- 所有属性 -->
<div class="transition-all duration-300">

<!-- 时间函数 -->
<div class="transition ease-in-out duration-300">
<div class="transition ease-out duration-500">

<!-- 延迟 -->
<div class="transition delay-150 duration-300">
```

## 关键帧动画

### 基本动画

```css
/* 定义关键帧 */
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

/* 应用动画 */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.slide-up {
  animation: slideUp 0.6s ease-out forwards;
}
```

### 动画属性

```css
.animated {
  animation-name: bounce;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-delay: 0.2s;
  animation-iteration-count: infinite;  /* 或具体数字 */
  animation-direction: alternate;       /* normal, reverse, alternate */
  animation-fill-mode: forwards;        /* none, forwards, backwards, both */
  animation-play-state: running;        /* running, paused */
}

/* 简写 */
.animated {
  animation: bounce 1s ease-in-out 0.2s infinite alternate forwards;
}
```

### 常用动画

```css
/* 脉冲 */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 弹跳 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 摇摆 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 闪烁 */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Tailwind 动画

```html
<!-- 内置动画 -->
<div class="animate-spin">       <!-- 旋转 -->
<div class="animate-ping">       <!-- 脉冲扩散 -->
<div class="animate-pulse">      <!-- 脉冲 -->
<div class="animate-bounce">     <!-- 弹跳 -->

<!-- 自定义动画 (tailwind.config.js) -->
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

## Transform 变换

```css
/* 位移 */
.translate { transform: translate(10px, 20px); }
.translate-x { transform: translateX(10px); }
.translate-y { transform: translateY(20px); }
.translate-z { transform: translateZ(10px); }

/* 缩放 */
.scale { transform: scale(1.5); }
.scale-x { transform: scaleX(1.5); }
.scale-y { transform: scaleY(0.8); }

/* 旋转 */
.rotate { transform: rotate(45deg); }
.rotate-x { transform: rotateX(45deg); }
.rotate-y { transform: rotateY(45deg); }

/* 倾斜 */
.skew { transform: skew(10deg, 5deg); }

/* 组合变换 */
.combined {
  transform: translateY(-10px) rotate(5deg) scale(1.1);
}

/* 变换原点 */
.origin-center { transform-origin: center; }
.origin-top { transform-origin: top; }
.origin-bottom-right { transform-origin: bottom right; }
```

## 交互效果

### 悬停效果

```css
/* 缩放悬停 */
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* 发光悬停 */
.hover-glow {
  transition: box-shadow 0.3s ease;
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

/* 边框动画 */
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

### 加载动画

```css
/* 旋转加载器 */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 点状加载器 */
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

/* 骨架屏 */
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

### 进入动画

```css
/* 淡入上移 */
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

/* 交错动画 */
.stagger > * {
  opacity: 0;
  animation: fadeUp 0.5s ease forwards;
}
.stagger > *:nth-child(1) { animation-delay: 0.1s; }
.stagger > *:nth-child(2) { animation-delay: 0.2s; }
.stagger > *:nth-child(3) { animation-delay: 0.3s; }
```

## 性能优化

```css
/* 使用 will-change */
.optimized {
  will-change: transform, opacity;
}

/* 使用 GPU 加速属性 */
.gpu-accelerated {
  transform: translateZ(0);
  /* 或 */
  backface-visibility: hidden;
}

/* 避免动画的属性 */
/* 推荐: transform, opacity */
/* 避免: width, height, top, left, margin, padding */
```

## 总结

CSS 动画要点：

1. **过渡** - 简单状态变化，transition 属性
2. **关键帧** - 复杂动画，@keyframes
3. **Transform** - 位移、缩放、旋转
4. **时间函数** - 控制动画节奏
5. **性能** - 优先使用 transform/opacity
