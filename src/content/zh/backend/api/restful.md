---
title: RESTful API 设计
description: RESTful API 设计原则、最佳实践与规范
order: 1
tags:
  - api
  - rest
  - http
  - backend
---

# RESTful API 设计

## REST 概述

REST (Representational State Transfer) 是一种软件架构风格，定义了一组用于创建 Web 服务的约束和原则。

```
REST 核心原则
├── 统一接口 - 标准化的资源操作
├── 无状态 - 请求包含所有信息
├── 可缓存 - 响应可标记为可缓存
├── 分层系统 - 客户端无需知道服务器架构
└── 按需代码 - 可选的代码下载
```

## 资源设计

### URL 设计

```
# 资源命名规范
GET    /users              # 获取用户列表
GET    /users/123          # 获取单个用户
POST   /users              # 创建用户
PUT    /users/123          # 更新用户
PATCH  /users/123          # 部分更新用户
DELETE /users/123          # 删除用户

# 嵌套资源
GET    /users/123/posts          # 用户的文章列表
GET    /users/123/posts/456      # 用户的特定文章
POST   /users/123/posts          # 为用户创建文章

# 避免的设计
GET    /getUsers            # ❌ 动词
GET    /user/list           # ❌ 动词
POST   /createUser          # ❌ 动词
GET    /users/get/123       # ❌ 冗余
```

### 命名约定

```
# 使用复数名词
/users          ✓
/user           ✗

# 使用小写和连字符
/user-profiles  ✓
/userProfiles   ✗
/user_profiles  ✗

# 资源层级不超过 3 层
/users/123/posts/456/comments     ✓
/users/123/posts/456/comments/789/replies  ✗ (太深)

# 使用查询参数过滤
/posts?author=123&status=published  ✓
/posts/author/123/status/published  ✗
```

## HTTP 方法

### 标准方法

```
方法      幂等性   安全性   用途
────────────────────────────────────
GET       是      是      获取资源
POST      否      否      创建资源
PUT       是      否      完整更新
PATCH     否      否      部分更新
DELETE    是      否      删除资源
HEAD      是      是      获取元信息
OPTIONS   是      是      获取支持的方法
```

### 方法使用示例

```http
# GET - 获取资源
GET /api/v1/users/123 HTTP/1.1
Host: api.example.com

# POST - 创建资源
POST /api/v1/users HTTP/1.1
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com"
}

# PUT - 完整更新
PUT /api/v1/users/123 HTTP/1.1
Content-Type: application/json

{
  "name": "Alice Smith",
  "email": "alice.smith@example.com",
  "age": 30
}

# PATCH - 部分更新
PATCH /api/v1/users/123 HTTP/1.1
Content-Type: application/json

{
  "name": "Alice Smith"
}

# DELETE - 删除资源
DELETE /api/v1/users/123 HTTP/1.1
```

## 状态码

### 常用状态码

```
2xx 成功
────────────────────────────
200 OK                 请求成功
201 Created            资源创建成功
204 No Content         成功但无返回内容

3xx 重定向
────────────────────────────
301 Moved Permanently  永久重定向
304 Not Modified       资源未修改

4xx 客户端错误
────────────────────────────
400 Bad Request        请求格式错误
401 Unauthorized       未认证
403 Forbidden          无权限
404 Not Found          资源不存在
405 Method Not Allowed 方法不允许
409 Conflict           资源冲突
422 Unprocessable      验证失败
429 Too Many Requests  请求过多

5xx 服务器错误
────────────────────────────
500 Internal Error     服务器错误
502 Bad Gateway        网关错误
503 Service Unavailable 服务不可用
504 Gateway Timeout    网关超时
```

### 状态码选择

```json
// 201 Created - 创建成功
POST /users
Response: 201 Created
Location: /users/123
{
  "id": 123,
  "name": "Alice"
}

// 204 No Content - 删除成功
DELETE /users/123
Response: 204 No Content

// 400 Bad Request - 请求格式错误
{
  "error": "Bad Request",
  "message": "Invalid JSON format"
}

// 422 Unprocessable Entity - 验证失败
{
  "error": "Validation Error",
  "details": [
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

## 请求与响应

### 请求头

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
Accept-Language: zh-CN
X-Request-ID: uuid-string
```

### 响应格式

```json
// 单个资源
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}

// 资源列表
{
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "totalPages": 5
  }
}

// 错误响应
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {"field": "email", "message": "Invalid format"}
    ]
  }
}
```

## 分页与过滤

### 分页

```http
# 偏移分页
GET /users?page=2&per_page=20

# 游标分页 (推荐大数据集)
GET /users?cursor=abc123&limit=20

# 响应
{
  "data": [...],
  "meta": {
    "total": 1000,
    "page": 2,
    "perPage": 20
  },
  "links": {
    "first": "/users?page=1",
    "prev": "/users?page=1",
    "next": "/users?page=3",
    "last": "/users?page=50"
  }
}
```

### 过滤与排序

```http
# 过滤
GET /users?status=active&role=admin
GET /posts?created_after=2024-01-01

# 排序
GET /users?sort=name           # 升序
GET /users?sort=-created_at    # 降序
GET /users?sort=name,-age      # 多字段

# 字段选择
GET /users?fields=id,name,email

# 搜索
GET /users?q=alice
GET /posts?search=keyword
```

## 版本控制

```http
# URL 路径版本 (推荐)
GET /api/v1/users
GET /api/v2/users

# 请求头版本
GET /api/users
Accept: application/vnd.api+json; version=1

# 查询参数版本
GET /api/users?version=1
```

## 认证与安全

```http
# Bearer Token
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# API Key
X-API-Key: your-api-key

# Basic Auth
Authorization: Basic base64(username:password)
```

### 安全最佳实践

```
1. 始终使用 HTTPS
2. 验证所有输入
3. 实现速率限制
4. 使用适当的 CORS 策略
5. 不在 URL 中暴露敏感信息
6. 实现请求日志和审计
```

## HATEOAS

```json
// Hypermedia as the Engine of Application State
{
  "id": 123,
  "name": "Alice",
  "status": "active",
  "_links": {
    "self": {"href": "/users/123"},
    "posts": {"href": "/users/123/posts"},
    "deactivate": {
      "href": "/users/123/deactivate",
      "method": "POST"
    }
  }
}
```

## 总结

RESTful API 设计要点：

1. **资源导向** - URL 表示资源，HTTP 方法表示操作
2. **正确状态码** - 准确反映请求结果
3. **一致性** - 统一的命名和响应格式
4. **版本控制** - 支持 API 演进
5. **安全性** - HTTPS、认证、验证
