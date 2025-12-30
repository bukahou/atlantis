---
title: SSR/SSG レンダリング
description: Next.js サーバーサイドレンダリング、静的生成と App Router
order: 3
tags:
  - react
  - nextjs
  - ssr
  - ssg
---

# SSR/SSG レンダリング

## レンダリングモード概要

Next.js は複数のレンダリングモードを提供し、ページの特性に応じて最適な方法を選択できます。

```
レンダリングモード
├── SSR (Server-Side Rendering) - サーバーサイドレンダリング
├── SSG (Static Site Generation) - 静的生成
├── ISR (Incremental Static Regeneration) - 増分静的再生成
├── CSR (Client-Side Rendering) - クライアントサイドレンダリング
└── Streaming - ストリーミングレンダリング
```

## App Router (Next.js 13+)

### サーバーコンポーネント

```tsx
// app/page.tsx - デフォルトでサーバーコンポーネント
async function HomePage() {
  // コンポーネント内で直接データ取得
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

### クライアントコンポーネント

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
// app/dashboard/page.tsx (サーバーコンポーネント)
import { Counter } from "./Counter";  // クライアントコンポーネント

async function DashboardPage() {
  const stats = await getStats();  // サーバーサイドデータ取得

  return (
    <div>
      <h1>Dashboard</h1>
      <Stats data={stats} />
      <Counter />  {/* クライアントインタラクション */}
    </div>
  );
}
```

## データ取得

### サーバーサイドデータ取得

```tsx
// デフォルトでキャッシュ
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

// キャッシュ無効化 (毎回リクエスト)
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    cache: "no-store",
  });
  return res.json();
}

// 時間ベース再検証
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 3600 },  // 1時間ごとに再検証
  });
  return res.json();
}

// タグベース再検証
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] },
  });
  return res.json();
}

// 手動再検証
import { revalidateTag, revalidatePath } from "next/cache";

async function createPost(data: PostData) {
  await db.posts.create(data);
  revalidateTag("posts");
  revalidatePath("/posts");
}
```

### 並列データ取得

```tsx
async function Dashboard() {
  // 並列取得 - 推奨
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

### データプリフェッチ

```tsx
// データプリフェッチ
import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (id: string) => {
    return await db.users.findUnique({ where: { id } });
  },
  ["user"],
  { revalidate: 3600, tags: ["user"] }
);
```

## ルーティング

### 動的ルート

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

// 静的パス生成
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default PostPage;
```

### キャッチオールルート

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

### ルートグループ

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

## メタデータ

### 静的メタデータ

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

### 動的メタデータ

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

## ローディングとエラー

### ローディング状態

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

### エラーハンドリング

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

### 404 ページ

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

// コンポーネント内でトリガー
import { notFound } from "next/navigation";

async function PostPage({ params }: Props) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return <article>{/* ... */}</article>;
}
```

## ストリーミングレンダリング

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

### ストリーミングデータ

```tsx
// 長いリストをストリーミング
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

## まとめ

SSR/SSG レンダリングのポイント：

1. **サーバーコンポーネント** - デフォルトモード、直接データ取得
2. **クライアントコンポーネント** - インタラクション、"use client" 使用
3. **データキャッシュ** - fetch キャッシュ、再検証戦略
4. **ストリーミング** - Suspense で UX 向上
5. **Server Actions** - サーバーサイドデータ変更
