---
title: ロードバランシング
description: ロードバランシングの原理、アルゴリズム、実践設定
order: 4
tags:
  - network
  - load-balancer
  - nginx
  - haproxy
---

# ロードバランシング

## ロードバランシングとは

ロードバランシングは、ネットワークトラフィックを複数のサーバーに分散する技術で、アプリケーションの可用性、信頼性、パフォーマンスを向上させます。

```
                    ┌─────────────┐
                    │  クライアント │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ロードバランサー│
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐┌─────▼─────┐┌─────▼─────┐
        │ サーバー1  ││ サーバー2  ││ サーバー3  │
        └───────────┘└───────────┘└───────────┘
```

## ロードバランシングの種類

### OSI 階層別

| タイプ | 階層 | 特徴 |
|--------|------|------|
| **L4 ロードバランシング** | トランスポート層 | IP + ポートベース、高性能 |
| **L7 ロードバランシング** | アプリケーション層 | コンテンツベース (URL, Header)、高機能 |

### L4 vs L7

```
L4 ロードバランシング:
クライアント ──TCP──> ロードバランサー ──TCP──> バックエンドサーバー
                    IP:Port のみ参照

L7 ロードバランシング:
クライアント ──HTTP──> ロードバランサー ──HTTP──> バックエンドサーバー
                      URL/Header/Cookie を解析
```

## ロードバランシングアルゴリズム

### ラウンドロビン (Round Robin)

```
リクエストを順番に各サーバーへ分散

リクエスト1 → Server1
リクエスト2 → Server2
リクエスト3 → Server3
リクエスト4 → Server1
...
```

### 重み付きラウンドロビン (Weighted Round Robin)

```
重み比率に基づいて分散

Server1 (weight=3): 3 リクエスト
Server2 (weight=2): 2 リクエスト
Server3 (weight=1): 1 リクエスト
```

### 最小接続 (Least Connections)

```
現在の接続数が最も少ないサーバーを選択

Server1: 10 接続
Server2: 5 接続  ← 新規リクエスト
Server3: 8 接続
```

### IP ハッシュ (IP Hash)

```
同じクライアント IP は常に同じサーバーにアクセス

hash(クライアントIP) % サーバー数 = 対象サーバー
```

### コンシステントハッシュ (Consistent Hash)

```
サーバー増減時の再分配問題を解決

     0
    /   \
   S1    S3
  /        \
 S2 ────── ハッシュリング
```

## Nginx 設定

### 基本設定

```nginx
http {
    upstream backend {
        server 192.168.1.101:8080;
        server 192.168.1.102:8080;
        server 192.168.1.103:8080;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

### ロードバランシングアルゴリズム

```nginx
upstream backend {
    # デフォルトはラウンドロビン
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

upstream backend_weighted {
    # 重み付きラウンドロビン
    server 192.168.1.101:8080 weight=3;
    server 192.168.1.102:8080 weight=2;
    server 192.168.1.103:8080 weight=1;
}

upstream backend_least_conn {
    # 最小接続
    least_conn;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

upstream backend_ip_hash {
    # IP ハッシュ
    ip_hash;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

upstream backend_hash {
    # コンシステントハッシュ
    hash $request_uri consistent;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}
```

### ヘルスチェック

```nginx
upstream backend {
    server 192.168.1.101:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.102:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.103:8080 backup;  # バックアップサーバー
}
```

### セッション維持

```nginx
upstream backend {
    ip_hash;  # IP ベースのセッション維持
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# または sticky cookie を使用 (nginx-sticky-module が必要)
upstream backend {
    sticky cookie srv_id expires=1h;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}
```

## HAProxy 設定

### 基本設定

```haproxy
global
    daemon
    maxconn 4096

defaults
    mode http
    timeout connect 5s
    timeout client 50s
    timeout server 50s

frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    server server1 192.168.1.101:8080 check
    server server2 192.168.1.102:8080 check
    server server3 192.168.1.103:8080 check
```

### ロードバランシングアルゴリズム

```haproxy
backend http_back
    # ラウンドロビン
    balance roundrobin

    # 最小接続
    balance leastconn

    # ソース IP ハッシュ
    balance source

    # URI ハッシュ
    balance uri

    server server1 192.168.1.101:8080 check weight 3
    server server2 192.168.1.102:8080 check weight 2
```

### ヘルスチェック

```haproxy
backend http_back
    option httpchk GET /health
    http-check expect status 200

    server server1 192.168.1.101:8080 check inter 5s fall 3 rise 2
    server server2 192.168.1.102:8080 check inter 5s fall 3 rise 2
```

### セッション維持

```haproxy
backend http_back
    balance roundrobin
    cookie SERVERID insert indirect nocache

    server server1 192.168.1.101:8080 check cookie s1
    server server2 192.168.1.102:8080 check cookie s2
```

## クラウドロードバランシング

### AWS ALB/NLB

```
ALB (Application Load Balancer):
- L7 ロードバランシング
- パスルーティング、ホストルーティング対応
- WebSocket 対応

NLB (Network Load Balancer):
- L4 ロードバランシング
- 超高性能
- 静的 IP 対応
```

### GCP Cloud Load Balancing

```
HTTP(S) Load Balancing:
- グローバル L7 ロードバランシング
- CDN 統合

TCP/UDP Load Balancing:
- リージョナル/グローバル L4
```

## 高可用性アーキテクチャ

### アクティブ-スタンバイ構成

```
         ┌──────────────┐
         │   仮想 IP    │
         │ (Keepalived) │
         └──────┬───────┘
          ┌─────┴─────┐
    ┌─────▼─────┐┌────▼────┐
    │ LB マスター ││ LB バックアップ │
    └─────┬─────┘└────┬────┘
          └─────┬─────┘
        バックエンドサーバー群
```

### Keepalived 設定

```bash
# /etc/keepalived/keepalived.conf

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1

    authentication {
        auth_type PASS
        auth_pass 1234
    }

    virtual_ipaddress {
        192.168.1.100
    }
}
```

## 監視メトリクス

### 主要メトリクス

| メトリクス | 説明 |
|-----------|------|
| QPS | 秒間クエリ数 |
| レスポンスタイム | リクエスト処理時間 |
| エラー率 | 失敗リクエストの割合 |
| 接続数 | 現在のアクティブ接続 |
| バックエンド健全性 | 各サーバーの状態 |

### Nginx ステータス監視

```nginx
location /nginx_status {
    stub_status on;
    allow 127.0.0.1;
    deny all;
}
```

```bash
# 出力例
Active connections: 291
server accepts handled requests
 16630948 16630948 31070465
Reading: 6 Writing: 179 Waiting: 106
```

## まとめ

ロードバランシングの核心ポイント：

1. **階層選択**: L4 は高性能、L7 は高機能
2. **アルゴリズム選択**: ビジネスシナリオに応じて適切なアルゴリズムを選択
3. **ヘルスチェック**: 障害ノードを自動的に除外
4. **セッション維持**: 必要に応じてセッションアフィニティを設定
5. **高可用性**: ロードバランサー自体も冗長化が必要
