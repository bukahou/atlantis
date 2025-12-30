---
title: GraphQL
description: GraphQL 查询语言、Schema 设计与最佳实践
order: 2
tags:
  - api
  - graphql
  - query
  - backend
---

# GraphQL

## GraphQL 概述

GraphQL 是一种用于 API 的查询语言，允许客户端精确请求所需数据，避免过度获取或不足获取。

```
GraphQL 特点
├── 精确查询 - 客户端指定返回字段
├── 单一端点 - 所有请求通过一个端点
├── 强类型 - Schema 定义类型系统
├── 内省 - API 自描述能力
└── 实时订阅 - 支持实时数据推送
```

## Schema 定义

### 类型系统

```graphql
# 标量类型
scalar DateTime
scalar JSON

# 枚举类型
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

# 对象类型
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

# 接口类型
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
}

# 联合类型
union SearchResult = User | Post | Comment
```

### 输入类型

```graphql
# 输入类型
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

### Query 和 Mutation

```graphql
type Query {
  # 单个资源
  user(id: ID!): User
  post(id: ID!): Post

  # 列表查询
  users(filter: UserFilterInput, pagination: PaginationInput): UserConnection!
  posts(filter: PostFilterInput, pagination: PaginationInput): PostConnection!

  # 搜索
  search(query: String!): [SearchResult!]!

  # 当前用户
  me: User
}

type Mutation {
  # 用户操作
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!

  # 文章操作
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

## 查询示例

### 基本查询

```graphql
# 简单查询
query GetUser {
  user(id: "123") {
    id
    name
    email
  }
}

# 嵌套查询
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

# 别名
query GetUsers {
  admin: user(id: "1") { name }
  guest: user(id: "2") { name }
}

# 片段
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

### 变量

```graphql
# 带变量的查询
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}

# 变量
{
  "id": "123"
}

# 带默认值
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

# 变量
{
  "input": {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "secret123"
  }
}
```

## 分页

### Relay 风格分页

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

# 查询
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

## Resolver 实现

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

## N+1 问题解决

```typescript
// DataLoader 解决 N+1
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

## 错误处理

```graphql
# 错误响应
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

## 总结

GraphQL 要点：

1. **类型系统** - 强类型 Schema 定义
2. **精确查询** - 客户端控制返回数据
3. **单一端点** - 所有操作通过一个 URL
4. **N+1 解决** - DataLoader 批量加载
5. **实时订阅** - Subscription 支持
