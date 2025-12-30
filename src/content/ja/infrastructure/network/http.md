---
title: HTTP プロトコル詳解
description: HTTP/HTTPS プロトコルの原理と実践を深く理解する
order: 3
tags:
  - network
  - http
  - https
  - web
---

# HTTP プロトコル詳解

## HTTP 基礎

HTTP (HyperText Transfer Protocol) は Web 通信の基盤プロトコルで、リクエスト-レスポンスモデルに基づいています。

### HTTP バージョンの進化

| バージョン | 年 | 特徴 |
|-----------|-----|------|
| HTTP/0.9 | 1991 | GET のみ対応、ヘッダーなし |
| HTTP/1.0 | 1996 | ヘッダー、ステータスコード、POST 導入 |
| HTTP/1.1 | 1997 | 持続的接続、パイプライン、Host ヘッダー |
| HTTP/2 | 2015 | 多重化、ヘッダー圧縮、サーバープッシュ |
| HTTP/3 | 2022 | QUIC (UDP) ベース、より低レイテンシ |

## リクエストとレスポンス

### リクエスト構造

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
│ リクエストライン: メソッド パス プロトコル │
├─────────────────────────────────┤
│ リクエストヘッダー                │
│ Host: example.com               │
│ Content-Type: application/json  │
├─────────────────────────────────┤
│ 空行                             │
├─────────────────────────────────┤
│ リクエストボディ (オプション)      │
└─────────────────────────────────┘
```

### レスポンス構造

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 27
Cache-Control: max-age=3600

{"id": 1, "name": "John"}
```

```
┌─────────────────────────────────┐
│ ステータスライン: プロトコル コード 説明 │
├─────────────────────────────────┤
│ レスポンスヘッダー                │
│ Content-Type: application/json  │
│ Content-Length: 27              │
├─────────────────────────────────┤
│ 空行                             │
├─────────────────────────────────┤
│ レスポンスボディ                  │
└─────────────────────────────────┘
```

## HTTP メソッド

| メソッド | 用途 | 冪等 | 安全 |
|---------|------|------|------|
| **GET** | リソース取得 | はい | はい |
| **POST** | リソース作成 | いいえ | いいえ |
| **PUT** | リソース置換 | はい | いいえ |
| **PATCH** | 部分更新 | いいえ | いいえ |
| **DELETE** | リソース削除 | はい | いいえ |
| **HEAD** | ヘッダー取得 | はい | はい |
| **OPTIONS** | 対応メソッド確認 | はい | はい |

### RESTful 例

```bash
# ユーザー一覧を取得
GET /api/users

# 単一ユーザーを取得
GET /api/users/123

# ユーザーを作成
POST /api/users
Content-Type: application/json
{"name": "John", "email": "john@example.com"}

# ユーザーを更新
PUT /api/users/123
Content-Type: application/json
{"name": "John Doe", "email": "john@example.com"}

# ユーザーを削除
DELETE /api/users/123
```

## ステータスコード

### 分類

| 範囲 | カテゴリ | 説明 |
|------|---------|------|
| 1xx | 情報 | リクエスト受信、処理継続 |
| 2xx | 成功 | リクエスト正常処理 |
| 3xx | リダイレクト | 追加操作が必要 |
| 4xx | クライアントエラー | リクエストに問題 |
| 5xx | サーバーエラー | サーバー処理失敗 |

### よく使うステータスコード

```
200 OK                    リクエスト成功
201 Created               リソース作成成功
204 No Content            成功だが返却内容なし

301 Moved Permanently     恒久リダイレクト
302 Found                 一時リダイレクト
304 Not Modified          リソース未変更 (キャッシュ有効)

400 Bad Request           リクエスト構文エラー
401 Unauthorized          未認証
403 Forbidden             アクセス禁止
404 Not Found             リソースが存在しない
405 Method Not Allowed    メソッド不許可
429 Too Many Requests     リクエスト過多

500 Internal Server Error サーバー内部エラー
502 Bad Gateway           ゲートウェイエラー
503 Service Unavailable   サービス利用不可
504 Gateway Timeout       ゲートウェイタイムアウト
```

## よく使うヘッダー

### リクエストヘッダー

| ヘッダー | 説明 | 例 |
|---------|------|-----|
| `Host` | 対象ホスト | `example.com` |
| `User-Agent` | クライアント識別 | `Mozilla/5.0...` |
| `Accept` | 受け入れコンテンツタイプ | `application/json` |
| `Content-Type` | リクエストボディタイプ | `application/json` |
| `Authorization` | 認証情報 | `Bearer token123` |
| `Cookie` | Cookie データ | `session=abc123` |
| `Cache-Control` | キャッシュ制御 | `no-cache` |

### レスポンスヘッダー

| ヘッダー | 説明 | 例 |
|---------|------|-----|
| `Content-Type` | レスポンスボディタイプ | `text/html; charset=utf-8` |
| `Content-Length` | レスポンスボディ長 | `1234` |
| `Set-Cookie` | Cookie 設定 | `session=abc; HttpOnly` |
| `Cache-Control` | キャッシュ制御 | `max-age=3600` |
| `Location` | リダイレクト先 | `https://new.example.com` |
| `Access-Control-*` | CORS 関連 | `Access-Control-Allow-Origin: *` |

## キャッシュメカニズム

### キャッシュ制御

```http
# レスポンスを 1 時間キャッシュ可能
Cache-Control: max-age=3600

# キャッシュ禁止
Cache-Control: no-store

# 毎回検証が必要
Cache-Control: no-cache

# プライベートキャッシュ (ブラウザのみ)
Cache-Control: private, max-age=3600

# パブリックキャッシュ (CDN も可)
Cache-Control: public, max-age=86400
```

### 条件付きリクエスト

```http
# サーバーが返却
ETag: "abc123"
Last-Modified: Wed, 01 Jan 2024 00:00:00 GMT

# クライアントが検証
If-None-Match: "abc123"
If-Modified-Since: Wed, 01 Jan 2024 00:00:00 GMT

# 未変更なら 304 を返却
HTTP/1.1 304 Not Modified
```

## HTTPS

### TLS ハンドシェイク

```
クライアント                      サーバー
   │                              │
   │  ──── Client Hello ────────> │  対応暗号スイート
   │                              │
   │  <─── Server Hello ───────── │  暗号スイート選択
   │  <─── Certificate ────────── │  サーバー証明書
   │  <─── Server Hello Done ──── │
   │                              │
   │  ──── Key Exchange ────────> │  鍵交換
   │  ──── Change Cipher Spec ──> │
   │  ──── Finished ────────────> │
   │                              │
   │  <─── Change Cipher Spec ─── │
   │  <─── Finished ───────────── │
   │                              │
   │      暗号化通信開始            │
```

### 証明書設定 (Nginx)

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

## CORS クロスオリジン

### 単純リクエスト

```http
# リクエスト
GET /api/data HTTP/1.1
Origin: https://example.com

# レスポンス
Access-Control-Allow-Origin: https://example.com
```

### プリフライトリクエスト

```http
# プリフライトリクエスト
OPTIONS /api/data HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type

# プリフライトレスポンス
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

## デバッグツール

### curl

```bash
# GET リクエスト
curl https://api.example.com/users

# POST リクエスト
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'

# レスポンスヘッダーを表示
curl -I https://example.com

# 詳細出力
curl -v https://example.com

# リダイレクトを追跡
curl -L https://example.com
```

### ブラウザ開発者ツール

- **Network パネル**: すべてのリクエストを表示
- **Headers**: リクエスト/レスポンスヘッダー
- **Preview/Response**: レスポンス内容
- **Timing**: リクエスト時間分析

## まとめ

HTTP プロトコルの核心ポイント：

1. **リクエストメソッド**: GET、POST、PUT、DELETE それぞれに意味がある
2. **ステータスコード**: 適切なステータスコードで結果を表現
3. **ヘッダー**: キャッシュ、認証、コンテンツネゴシエーションを制御
4. **HTTPS**: TLS 暗号化で通信を保護
5. **CORS**: クロスオリジンリソース共有メカニズム
