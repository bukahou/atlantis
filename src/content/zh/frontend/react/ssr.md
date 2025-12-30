---
title: SSR/SSG 渲染
description: Next.js 服务端渲染、静态生成与 App Router
order: 3
tags:
  - react
  - nextjs
  - ssr
  - ssg
---

# SSR/SSG 渲染

## 渲染模式概述

Next.js 提供多种渲染模式，根据页面特性选择最优方案。

```
渲染模式
├── SSR (Server-Side Rendering) - 服务端渲染
├── SSG (Static Site Generation) - 静态生成
├── ISR (Incremental Static Regeneration) - 增量静态再生
├── CSR (Client-Side Rendering) - 客户端渲染
└── Streaming - 流式渲染
```

## App Router (Next.js 13+)

### 服务端组件

```tsx
// app/page.tsx - 默认是服务端组件
async function HomePage() {
  // 直接在组件中获取数据
  const data = await fetch("https://api.example.com/data");
  const posts = await data.json();

  return (
    <main>
      <h1>Posts</h1>
      {posts.map((post: Post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}

export default HomePage;
```

### 客户端组件

```tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### 混合使用

```tsx
// app/dashboard/page.tsx (服务端组件)
import { Counter } from "./Counter";  // 客户端组件

async function DashboardPage() {
  const stats = await getStats();  // 服务端数据获取

  return (
    <div>
      <h1>Dashboard</h1>
      <Stats data={stats} />
      <Counter />  {/* 客户端交互 */}
    </div>
  );
}
```

## 数据获取

### 服务端数据获取

```tsx
// 默认缓存
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

// 禁用缓存 (每次请求重新获取)
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    cache: "no-store",
  });
  return res.json();
}

// 定时重新验证
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 3600 },  // 每小时重新验证
  });
  return res.json();
}

// 基于标签重新验证
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] },
  });
  return res.json();
}

// 手动重新验证
import { revalidateTag, revalidatePath } from "next/cache";

async function createPost(data: PostData) {
  await db.posts.create(data);
  revalidateTag("posts");
  revalidatePath("/posts");
}
```

### 并行数据获取

```tsx
async function Dashboard() {
  // 并行获取 - 推荐
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
      <CommentList comments={comments} />
    </div>
  );
}
```

### 数据预取

```tsx
// 预取数据
import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (id: string) => {
    return await db.users.findUnique({ where: { id } });
  },
  ["user"],
  { revalidate: 3600, tags: ["user"] }
);
```

## 路由

### 动态路由

```tsx
// app/posts/[id]/page.tsx
interface Props {
  params: { id: string };
}

async function PostPage({ params }: Props) {
  const post = await getPost(params.id);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// 生成静态路径
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default PostPage;
```

### 捕获所有路由

```tsx
// app/docs/[...slug]/page.tsx
interface Props {
  params: { slug: string[] };
}

function DocsPage({ params }: Props) {
  // /docs/a/b/c -> slug = ['a', 'b', 'c']
  return <div>Slug: {params.slug.join("/")}</div>;
}
```

### 路由组

```
app/
├── (marketing)/
│   ├── about/page.tsx
│   └── contact/page.tsx
├── (shop)/
│   ├── products/page.tsx
│   └── cart/page.tsx
└── layout.tsx
```

## 元数据

### 静态元数据

```tsx
// app/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Page",
  description: "Welcome to our website",
  openGraph: {
    title: "Home Page",
    description: "Welcome to our website",
    images: ["/og-image.png"],
  },
};
```

### 动态元数据

```tsx
// app/posts/[id]/page.tsx
import { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.image],
    },
  };
}
```

## 加载与错误

### 加载状态

```tsx
// app/posts/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}
```

### 错误处理

```tsx
"use client";

// app/posts/error.tsx
interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  return (
    <div className="error">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 404 页面

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find the requested resource</p>
    </div>
  );
}

// 在组件中触发
import { notFound } from "next/navigation";

async function PostPage({ params }: Props) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return <article>{/* ... */}</article>;
}
```

## 流式渲染

### Suspense

```tsx
import { Suspense } from "react";

async function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<LoadingSkeleton />}>
        <SlowComponent />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <AnotherSlowComponent />
      </Suspense>
    </div>
  );
}
```

### 流式数据

```tsx
// 流式传输长列表
async function PostList() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map((post) => (
        <Suspense key={post.id} fallback={<PostSkeleton />}>
          <PostItem id={post.id} />
        </Suspense>
      ))}
    </ul>
  );
}
```

## Server Actions

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await db.posts.create({
    data: { title, content },
  });

  revalidatePath("/posts");
}

// app/posts/new/page.tsx
import { createPost } from "../actions";

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## 总结

SSR/SSG 渲染要点：

1. **服务端组件** - 默认渲染模式，直接数据获取
2. **客户端组件** - 交互逻辑，使用 "use client"
3. **数据缓存** - fetch 缓存、重新验证策略
4. **流式渲染** - Suspense 提升用户体验
5. **Server Actions** - 服务端数据变更
