---
title: GraphQL
description: GraphQL クエリ言語、Schema 設計とベストプラクティス
order: 2
tags:
  - api
  - graphql
  - query
  - backend
---

# GraphQL

## GraphQL 概要

GraphQL は API のためのクエリ言語で、クライアントが必要なデータを正確にリクエストでき、過剰取得や不足取得を回避できます。

```
GraphQL の特徴
├── 精確なクエリ - クライアントが返却フィールドを指定
├── 単一エンドポイント - すべてのリクエストが 1 つのエンドポイント
├── 強い型付け - Schema で型システム定義
├── イントロスペクション - API 自己記述能力
└── リアルタイムサブスクリプション - リアルタイムデータ配信
```

## Schema 定義

### 型システム

```graphql
# スカラー型
scalar DateTime
scalar JSON

# 列挙型
enum UserRole {
  ADMIN
  USER
  GUEST
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

# オブジェクト型
type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  status: PostStatus!
  author: User!
  comments: [Comment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: DateTime!
}

# インターフェース型
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
}

# ユニオン型
union SearchResult = User | Post | Comment
```

### 入力型

```graphql
# 入力型
input CreateUserInput {
  name: String!
  email: String!
  password: String!
  role: UserRole = USER
}

input UpdateUserInput {
  name: String
  email: String
}

input PostFilterInput {
  status: PostStatus
  authorId: ID
  search: String
}

input PaginationInput {
  page: Int = 1
  limit: Int = 20
}
```

### Query と Mutation

```graphql
type Query {
  # 単一リソース
  user(id: ID!): User
  post(id: ID!): Post

  # 一覧クエリ
  users(filter: UserFilterInput, pagination: PaginationInput): UserConnection!
  posts(filter: PostFilterInput, pagination: PaginationInput): PostConnection!

  # 検索
  search(query: String!): [SearchResult!]!

  # 現在のユーザー
  me: User
}

type Mutation {
  # ユーザー操作
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!

  # 記事操作
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  publishPost(id: ID!): Post!
}

type Subscription {
  postCreated: Post!
  commentAdded(postId: ID!): Comment!
}
```

## クエリ例

### 基本クエリ

```graphql
# シンプルクエリ
query GetUser {
  user(id: "123") {
    id
    name
    email
  }
}

# ネストクエリ
query GetUserWithPosts {
  user(id: "123") {
    name
    posts {
      title
      status
      comments {
        content
        author {
          name
        }
      }
    }
  }
}

# エイリアス
query GetUsers {
  admin: user(id: "1") { name }
  guest: user(id: "2") { name }
}

# フラグメント
fragment UserFields on User {
  id
  name
  email
}

query GetUsers {
  user1: user(id: "1") { ...UserFields }
  user2: user(id: "2") { ...UserFields }
}
```

### 変数

```graphql
# 変数付きクエリ
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}

# 変数
{
  "id": "123"
}

# デフォルト値付き
query GetPosts($status: PostStatus = PUBLISHED, $limit: Int = 10) {
  posts(filter: { status: $status }, pagination: { limit: $limit }) {
    edges {
      node {
        title
      }
    }
  }
}
```

### Mutation

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# 変数
{
  "input": {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "secret123"
  }
}
```

## ページネーション

### Relay スタイルページネーション

```graphql
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# クエリ
query GetUsers($first: Int!, $after: String) {
  users(first: $first, after: $after) {
    edges {
      node {
        id
        name
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

## Resolver 実装

```typescript
// TypeScript + Apollo Server
const resolvers = {
  Query: {
    user: async (_, { id }, context) => {
      return context.dataSources.userAPI.getUser(id);
    },

    users: async (_, { filter, pagination }, context) => {
      return context.dataSources.userAPI.getUsers(filter, pagination);
    },
  },

  Mutation: {
    createUser: async (_, { input }, context) => {
      return context.dataSources.userAPI.createUser(input);
    },
  },

  User: {
    posts: async (parent, _, context) => {
      return context.dataSources.postAPI.getPostsByAuthor(parent.id);
    },
  },

  Subscription: {
    postCreated: {
      subscribe: (_, __, { pubsub }) => {
        return pubsub.asyncIterator(['POST_CREATED']);
      },
    },
  },
};
```

## N+1 問題の解決

```typescript
// DataLoader で N+1 解決
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (ids) => {
  const users = await User.findByIds(ids);
  return ids.map(id => users.find(u => u.id === id));
});

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId),
  },
};
```

## エラーハンドリング

```graphql
# エラーレスポンス
{
  "data": null,
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    }
  ]
}
```

## まとめ

GraphQL のポイント：

1. **型システム** - 強い型付け Schema 定義
2. **精確なクエリ** - クライアントが返却データを制御
3. **単一エンドポイント** - すべての操作が 1 つの URL
4. **N+1 解決** - DataLoader でバッチロード
5. **リアルタイムサブスクリプション** - Subscription サポート
