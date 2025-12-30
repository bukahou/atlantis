---
title: RESTful API 設計
description: RESTful API 設計原則、ベストプラクティスと規約
order: 1
tags:
  - api
  - rest
  - http
  - backend
---

# RESTful API 設計

## REST 概要

REST (Representational State Transfer) は、Web サービスを作成するための制約と原則を定義したソフトウェアアーキテクチャスタイルです。

```
REST コア原則
├── 統一インターフェース - 標準化されたリソース操作
├── ステートレス - リクエストに全情報を含む
├── キャッシュ可能 - レスポンスをキャッシュ可能
├── 階層システム - クライアントはサーバー構成を知らない
└── オンデマンドコード - オプションのコードダウンロード
```

## リソース設計

### URL 設計

```
# リソース命名規約
GET    /users              # ユーザー一覧取得
GET    /users/123          # 単一ユーザー取得
POST   /users              # ユーザー作成
PUT    /users/123          # ユーザー更新
PATCH  /users/123          # 部分更新
DELETE /users/123          # ユーザー削除

# ネストリソース
GET    /users/123/posts          # ユーザーの記事一覧
GET    /users/123/posts/456      # ユーザーの特定記事
POST   /users/123/posts          # ユーザーの記事作成

# 避けるべき設計
GET    /getUsers            # ❌ 動詞
GET    /user/list           # ❌ 動詞
POST   /createUser          # ❌ 動詞
GET    /users/get/123       # ❌ 冗長
```

### 命名規約

```
# 複数形名詞を使用
/users          ✓
/user           ✗

# 小文字とハイフン
/user-profiles  ✓
/userProfiles   ✗
/user_profiles  ✗

# リソース階層は 3 層以内
/users/123/posts/456/comments     ✓
/users/123/posts/456/comments/789/replies  ✗ (深すぎる)

# クエリパラメータでフィルタ
/posts?author=123&status=published  ✓
/posts/author/123/status/published  ✗
```

## HTTP メソッド

### 標準メソッド

```
メソッド  冪等性   安全性   用途
────────────────────────────────────
GET       ○      ○      リソース取得
POST      ✗      ✗      リソース作成
PUT       ○      ✗      完全更新
PATCH     ✗      ✗      部分更新
DELETE    ○      ✗      リソース削除
HEAD      ○      ○      メタ情報取得
OPTIONS   ○      ○      対応メソッド取得
```

### メソッド使用例

```http
# GET - リソース取得
GET /api/v1/users/123 HTTP/1.1
Host: api.example.com

# POST - リソース作成
POST /api/v1/users HTTP/1.1
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com"
}

# PUT - 完全更新
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

# DELETE - リソース削除
DELETE /api/v1/users/123 HTTP/1.1
```

## ステータスコード

### よく使うステータスコード

```
2xx 成功
────────────────────────────
200 OK                 リクエスト成功
201 Created            リソース作成成功
204 No Content         成功、返却内容なし

3xx リダイレクト
────────────────────────────
301 Moved Permanently  永久リダイレクト
304 Not Modified       リソース未変更

4xx クライアントエラー
────────────────────────────
400 Bad Request        リクエスト形式エラー
401 Unauthorized       未認証
403 Forbidden          権限なし
404 Not Found          リソース存在しない
405 Method Not Allowed メソッド不許可
409 Conflict           リソース競合
422 Unprocessable      バリデーション失敗
429 Too Many Requests  リクエスト過多

5xx サーバーエラー
────────────────────────────
500 Internal Error     サーバーエラー
502 Bad Gateway        ゲートウェイエラー
503 Service Unavailable サービス利用不可
504 Gateway Timeout    ゲートウェイタイムアウト
```

### ステータスコード選択

```json
// 201 Created - 作成成功
POST /users
Response: 201 Created
Location: /users/123
{
  "id": 123,
  "name": "Alice"
}

// 204 No Content - 削除成功
DELETE /users/123
Response: 204 No Content

// 400 Bad Request - リクエスト形式エラー
{
  "error": "Bad Request",
  "message": "Invalid JSON format"
}

// 422 Unprocessable Entity - バリデーション失敗
{
  "error": "Validation Error",
  "details": [
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

## リクエストとレスポンス

### リクエストヘッダー

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
Accept-Language: ja-JP
X-Request-ID: uuid-string
```

### レスポンス形式

```json
// 単一リソース
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}

// リソース一覧
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

// エラーレスポンス
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

## ページネーションとフィルタ

### ページネーション

```http
# オフセットページネーション
GET /users?page=2&per_page=20

# カーソルページネーション (大規模データ推奨)
GET /users?cursor=abc123&limit=20

# レスポンス
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

### フィルタとソート

```http
# フィルタ
GET /users?status=active&role=admin
GET /posts?created_after=2024-01-01

# ソート
GET /users?sort=name           # 昇順
GET /users?sort=-created_at    # 降順
GET /users?sort=name,-age      # 複数フィールド

# フィールド選択
GET /users?fields=id,name,email

# 検索
GET /users?q=alice
GET /posts?search=keyword
```

## バージョン管理

```http
# URL パスバージョン (推奨)
GET /api/v1/users
GET /api/v2/users

# リクエストヘッダーバージョン
GET /api/users
Accept: application/vnd.api+json; version=1

# クエリパラメータバージョン
GET /api/users?version=1
```

## 認証とセキュリティ

```http
# Bearer Token
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# API Key
X-API-Key: your-api-key

# Basic Auth
Authorization: Basic base64(username:password)
```

### セキュリティベストプラクティス

```
1. 常に HTTPS を使用
2. すべての入力を検証
3. レート制限を実装
4. 適切な CORS ポリシー
5. URL に機密情報を含めない
6. リクエストログと監査を実装
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

## まとめ

RESTful API 設計のポイント：

1. **リソース指向** - URL はリソース、HTTP メソッドは操作
2. **正確なステータスコード** - 結果を正確に反映
3. **一貫性** - 統一された命名とレスポンス形式
4. **バージョン管理** - API の進化をサポート
5. **セキュリティ** - HTTPS、認証、検証
