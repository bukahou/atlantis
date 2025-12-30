---
title: HTTP 协议详解
description: 深入理解 HTTP/HTTPS 协议原理与实践
order: 3
tags:
  - network
  - http
  - https
  - web
---

# HTTP 协议详解

## HTTP 基础

HTTP (HyperText Transfer Protocol) 是 Web 通信的基础协议，基于请求-响应模型。

### HTTP 版本演进

| 版本 | 年份 | 特点 |
|------|------|------|
| HTTP/0.9 | 1991 | 仅支持 GET，无头部 |
| HTTP/1.0 | 1996 | 引入头部、状态码、POST |
| HTTP/1.1 | 1997 | 持久连接、管道化、Host 头 |
| HTTP/2 | 2015 | 多路复用、头部压缩、服务器推送 |
| HTTP/3 | 2022 | 基于 QUIC (UDP)、更低延迟 |

## 请求与响应

### 请求结构

```http
GET /api/users HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: application/json
Authorization: Bearer token123
Content-Type: application/json

{"name": "John"}
```

```
┌─────────────────────────────────┐
│ 请求行: 方法 路径 协议版本        │
├─────────────────────────────────┤
│ 请求头部                         │
│ Host: example.com               │
│ Content-Type: application/json  │
├─────────────────────────────────┤
│ 空行                             │
├─────────────────────────────────┤
│ 请求体 (可选)                    │
└─────────────────────────────────┘
```

### 响应结构

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 27
Cache-Control: max-age=3600

{"id": 1, "name": "John"}
```

```
┌─────────────────────────────────┐
│ 状态行: 协议版本 状态码 状态描述   │
├─────────────────────────────────┤
│ 响应头部                         │
│ Content-Type: application/json  │
│ Content-Length: 27              │
├─────────────────────────────────┤
│ 空行                             │
├─────────────────────────────────┤
│ 响应体                           │
└─────────────────────────────────┘
```

## HTTP 方法

| 方法 | 用途 | 幂等 | 安全 |
|------|------|------|------|
| **GET** | 获取资源 | 是 | 是 |
| **POST** | 创建资源 | 否 | 否 |
| **PUT** | 替换资源 | 是 | 否 |
| **PATCH** | 部分更新 | 否 | 否 |
| **DELETE** | 删除资源 | 是 | 否 |
| **HEAD** | 获取头部 | 是 | 是 |
| **OPTIONS** | 查询支持方法 | 是 | 是 |

### RESTful 示例

```bash
# 获取用户列表
GET /api/users

# 获取单个用户
GET /api/users/123

# 创建用户
POST /api/users
Content-Type: application/json
{"name": "John", "email": "john@example.com"}

# 更新用户
PUT /api/users/123
Content-Type: application/json
{"name": "John Doe", "email": "john@example.com"}

# 删除用户
DELETE /api/users/123
```

## 状态码

### 分类

| 范围 | 类别 | 说明 |
|------|------|------|
| 1xx | 信息 | 请求已接收，继续处理 |
| 2xx | 成功 | 请求已成功处理 |
| 3xx | 重定向 | 需要进一步操作 |
| 4xx | 客户端错误 | 请求有误 |
| 5xx | 服务器错误 | 服务器处理失败 |

### 常用状态码

```
200 OK                    请求成功
201 Created               资源已创建
204 No Content            成功但无返回内容

301 Moved Permanently     永久重定向
302 Found                 临时重定向
304 Not Modified          资源未修改 (缓存有效)

400 Bad Request           请求语法错误
401 Unauthorized          未认证
403 Forbidden             无权限
404 Not Found             资源不存在
405 Method Not Allowed    方法不允许
429 Too Many Requests     请求过多

500 Internal Server Error 服务器内部错误
502 Bad Gateway           网关错误
503 Service Unavailable   服务不可用
504 Gateway Timeout       网关超时
```

## 常用头部

### 请求头

| 头部 | 说明 | 示例 |
|------|------|------|
| `Host` | 目标主机 | `example.com` |
| `User-Agent` | 客户端标识 | `Mozilla/5.0...` |
| `Accept` | 接受的内容类型 | `application/json` |
| `Content-Type` | 请求体类型 | `application/json` |
| `Authorization` | 认证凭证 | `Bearer token123` |
| `Cookie` | Cookie 数据 | `session=abc123` |
| `Cache-Control` | 缓存控制 | `no-cache` |

### 响应头

| 头部 | 说明 | 示例 |
|------|------|------|
| `Content-Type` | 响应体类型 | `text/html; charset=utf-8` |
| `Content-Length` | 响应体长度 | `1234` |
| `Set-Cookie` | 设置 Cookie | `session=abc; HttpOnly` |
| `Cache-Control` | 缓存控制 | `max-age=3600` |
| `Location` | 重定向地址 | `https://new.example.com` |
| `Access-Control-*` | CORS 相关 | `Access-Control-Allow-Origin: *` |

## 缓存机制

### 缓存控制

```http
# 响应可缓存 1 小时
Cache-Control: max-age=3600

# 禁止缓存
Cache-Control: no-store

# 每次需验证
Cache-Control: no-cache

# 私有缓存 (浏览器可缓存)
Cache-Control: private, max-age=3600

# 公共缓存 (CDN 可缓存)
Cache-Control: public, max-age=86400
```

### 条件请求

```http
# 服务器返回
ETag: "abc123"
Last-Modified: Wed, 01 Jan 2024 00:00:00 GMT

# 客户端验证
If-None-Match: "abc123"
If-Modified-Since: Wed, 01 Jan 2024 00:00:00 GMT

# 未修改返回 304
HTTP/1.1 304 Not Modified
```

## HTTPS

### TLS 握手

```
客户端                          服务器
   │                              │
   │  ──── Client Hello ────────> │  支持的加密套件
   │                              │
   │  <─── Server Hello ───────── │  选择加密套件
   │  <─── Certificate ────────── │  服务器证书
   │  <─── Server Hello Done ──── │
   │                              │
   │  ──── Key Exchange ────────> │  密钥交换
   │  ──── Change Cipher Spec ──> │
   │  ──── Finished ────────────> │
   │                              │
   │  <─── Change Cipher Spec ─── │
   │  <─── Finished ───────────── │
   │                              │
   │      加密通信开始             │
```

### 证书配置 (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

## CORS 跨域

### 简单请求

```http
# 请求
GET /api/data HTTP/1.1
Origin: https://example.com

# 响应
Access-Control-Allow-Origin: https://example.com
```

### 预检请求

```http
# 预检请求
OPTIONS /api/data HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type

# 预检响应
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

## 调试工具

### curl

```bash
# GET 请求
curl https://api.example.com/users

# POST 请求
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'

# 查看响应头
curl -I https://example.com

# 详细输出
curl -v https://example.com

# 跟随重定向
curl -L https://example.com
```

### 浏览器开发者工具

- **Network 面板**: 查看所有请求
- **Headers**: 请求/响应头
- **Preview/Response**: 响应内容
- **Timing**: 请求时间分析

## 总结

HTTP 协议核心要点：

1. **请求方法**: GET、POST、PUT、DELETE 各有语义
2. **状态码**: 正确使用状态码表达结果
3. **头部**: 控制缓存、认证、内容协商
4. **HTTPS**: TLS 加密保护传输安全
5. **CORS**: 跨域资源共享机制
